// ================================================================
//  3-Bit Flash ADC — Brightness Level Sensor
//  Circuit: Resistor Ladder (3.3V / 8 steps)
//           7x Comparators (e.g., 2x LM339)
//           Priority Encoder (74HC148: thermometer -> 3-bit binary)
//           Input: LDR voltage divider → Vin
//
//  Arduino Nano:
//    A6       → LDR voltage monitor (ANALOG-ONLY pin)
//    A4 (SDA) → LCD I2C Data
//    A5 (SCL) → LCD I2C Clock
//
//  LCD: 16x2 I2C (PCF8574 backpack, address 0x27 or 0x3F)
//
//  Required Libraries (install via Tools > Manage Libraries):
//    - LiquidCrystal_I2C  by Frank de Brabander
//    - Wire               (built-in)
//
//  Display layout (main screen):
//    Line 1: "1.24V [011] Lv:3"
//             ^Vin  ^3-bit ^Level (0-7)
//    Line 2: "[||||    ] SOFT "
//             ^8-bar    ^Label
// ================================================================

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ----------------------------------------------------------------
//  LCD Setup
//  Address 0x27 is the default for most PCF8574-based backpacks.
//  If the screen is blank or shows garbled text, change to 0x3F.
//  A4 = SDA, A5 = SCL on Nano — these are hardware I2C pins.
// ----------------------------------------------------------------
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ----------------------------------------------------------------
//  Pin & Circuit Constants
// ----------------------------------------------------------------
#define LDR_VOLTAGE_PIN  A6      // Analog-ONLY pin on Nano — do NOT use digitalWrite/digitalRead here

#define VREF_NANO        5.0f   // Arduino Nano's ADC reference = 5V (default)
#define V_CIRCUIT_MAX    3.3f   // Resistor ladder top voltage (3.3V rail)
#define N_LEVELS         8      // 3-bit ADC → 2^3 = 8 levels (0 to 7)

// Each level occupies a voltage window of: 3.3 / 8 = 0.4125V
// Level 0: 0.000V – 0.412V
// Level 1: 0.413V – 0.825V  ... etc up to Level 7: 2.888V – 3.300V

#define REFRESH_MS       150    // LCD update interval in ms — keeps display stable

// ----------------------------------------------------------------
//  Custom LCD Characters (stored in HD44780 CGRAM slots 0–4)
//  Each character is 5 pixels wide × 8 pixels tall.
//  Bits: 1 = pixel ON, 0 = pixel OFF (only right 5 bits matter).
// ----------------------------------------------------------------

// Slot 0 — Sun icon: displayed at max brightness (level 7)
byte sunChar[8] = {
  0b00100,   //   *
  0b10101,   // * * *
  0b01110,   //  ***
  0b11111,   // *****
  0b01110,   //  ***
  0b10101,   // * * *
  0b00100,   //   *
  0b00000
};

// Slot 1 — Crescent moon: displayed at zero light (level 0)
byte moonChar[8] = {
  0b00110,   //   **
  0b01100,   //  **
  0b11000,   // **
  0b11000,   // **
  0b11000,   // **
  0b01100,   //  **
  0b00110,   //   **
  0b00000
};

// Slot 2 — Lightning bolt: displayed at mid-levels (1–6) on line 1 header
byte boltChar[8] = {
  0b00110,   //   **
  0b01100,   //  **
  0b11111,   // *****
  0b00110,   //   **
  0b01100,   //  **
  0b11000,   // **
  0b00000,
  0b00000
};

// Slot 3 — Half bar (left column only) — for smooth bar transitions
byte halfBar[8] = {
  0b10000,   // *
  0b10000,   // *
  0b10000,   // *
  0b10000,   // *
  0b10000,   // *
  0b10000,   // *
  0b10000,   // *
  0b10000    // *
};

// Slot 4 — Resistor ladder symbol: a small resistor icon
byte rungChar[8] = {
  0b01110,   //  ***
  0b10001,   // *   *
  0b10001,   // *   *
  0b01110,   //  ***
  0b00100,   //   *
  0b00100,   //   *
  0b00000,
  0b00000
};

// ----------------------------------------------------------------
//  Brightness Labels — exactly 4 chars each (padded).
//  Placed at LCD positions 12–15 on line 2 (after the 8-char bar).
// ----------------------------------------------------------------
//                               0         1       2       3
//                               4       5       6       7
const char LABELS[8][5] = {
  "DARK",  // Level 0: very low LDR voltage
  "FINT",  // Level 1: faint — barely a flicker
  "DIM ",  // Level 2: dim — candle / nightlight level
  "SOFT",  // Level 3: soft — lamp in a dark room
  "ROOM",  // Level 4: normal room lighting
  "BRIT",  // Level 5: bright — well-lit workspace
  "VVID",  // Level 6: vivid — direct sunlight
  "SUN!",  // Level 7: intense — max saturation
};

// ----------------------------------------------------------------
//  State Variables
// ----------------------------------------------------------------
int  lastLevel   = -1;           // Track previous level to avoid wasteful redraws
unsigned long lastRefresh = 0;   // Timestamp of the last display update

// ================================================================
//  splashScreen — animated boot sequence across 3 screens
// ================================================================
void splashScreen() {

  // --- Screen 1: Project title ---
  lcd.setCursor(0, 0);
  lcd.print("  3-bit Flash   ");
  lcd.setCursor(0, 1);
  lcd.print("   ADC  Sensor  ");
  delay(1600);

  // --- Screen 2: Circuit info with resistor icon ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Vref:3.3V");
  lcd.setCursor(9, 0);
  lcd.write((byte)4);            // Resistor icon
  lcd.print(" 8-Lvl");
  lcd.setCursor(0, 1);
  lcd.print("Step:0.4125V/Lv ");
  delay(1800);

  // --- Screen 3: Animated loading bar (simulates ADC sweep) ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("LDR Sensor Input");
  lcd.setCursor(0, 1);
  lcd.print('[');
  for (int i = 0; i < 8; i++) {
    lcd.write(0xFF);             // 0xFF = full block (built into HD44780 charset)
    delay(110);
  }
  lcd.print("] GO!");
  delay(900);

  lcd.clear();
}

// ================================================================
//  printBin3 — prints the 3-bit binary of val (0–7) on LCD
//  e.g., val = 5 → prints "101"
//  Uses bit-shifting to extract each bit from MSB to LSB.
// ================================================================
void printBin3(int val) {
  lcd.print((val >> 2) & 1);   // Bit 2 (MSB): isolate with mask after shift
  lcd.print((val >> 1) & 1);   // Bit 1 (mid): same approach
  lcd.print(val & 1);          // Bit 0 (LSB): no shift needed, just mask
}

// ================================================================
//  drawLine1 — updates the top row of the LCD
//
//  Format (16 chars):   "1.24V [011] Lv:3"
//  Positions:            01234 5 678 9 0123 4 5
//                        Vin     Bin    Level
//
//  The 3-bit binary shown here is what the 74HC148 priority
//  encoder produces from the 7 comparator outputs in the circuit.
// ================================================================
void drawLine1(float voltage, int level) {
  lcd.setCursor(0, 0);

  // Voltage field — always 4 chars + 'V' = 5 chars total
  // lcd.print(float, decimals) auto-formats: "0.41", "1.24", "3.30"
  lcd.print(voltage, 2);     // e.g., "1.24"
  lcd.print('V');            // → "1.24V"

  lcd.print(" [");           // 2 chars — opens the binary bracket
  printBin3(level);          // 3 chars — e.g., "011"
  lcd.print("] ");           // 2 chars — closes bracket + space

  lcd.print("Lv:");          // 3 chars
  lcd.print(level);          // 1 char — level digit (0–7)
  // Grand total: 5 + 2 + 3 + 2 + 3 + 1 = 16 chars ✓
}

// ================================================================
//  drawLine2 — updates the bottom row of the LCD
//
//  Format (16 chars):   "[||||    ]  SOFT"
//  Positions:            0123456789 0 1234
//                        ^bar 10    ^  label
//
//  Bar has 8 positions — 1 per brightness level.
//  Filled blocks (0xFF) indicate how many thresholds are crossed.
//  This mirrors the thermometer code at the comparator outputs.
// ================================================================
void drawLine2(int level) {
  lcd.setCursor(0, 1);

  lcd.print('[');                      // Opening bracket (pos 0)

  for (int i = 0; i < 8; i++) {
    // Fill bar up to 'level' blocks, leave rest as spaces
    // i < level → this bucket/threshold has been crossed
    if (i < level) {
      lcd.write(0xFF);                 // Solid block — threshold crossed
    } else {
      lcd.print(' ');                  // Empty — threshold not reached
    }
  }

  lcd.print(']');                      // Closing bracket (pos 9)
  lcd.print("  ");                     // 2-space separator (pos 10–11)

  // Label (pos 12–15): 4-char brightness description
  // Special case: show custom icon for levels 0 and 7
  if (level == 7) {
    lcd.print("SUN");
    lcd.write((byte)0);                // Sun icon (CGRAM slot 0) at pos 15
  } else if (level == 0) {
    lcd.print("DRK");
    lcd.write((byte)1);                // Moon icon (CGRAM slot 1) at pos 15
  } else {
    lcd.print(LABELS[level]);          // Standard 4-char label for levels 1–6
  }
  // Total: 1+8+1+2+4 = 16 chars ✓
}

// ================================================================
//  sweepBar — animates the bar from oldLevel to newLevel
//  This gives a smooth visual transition when brightness changes,
//  making the "thermometer code settling" effect visible.
// ================================================================
void sweepBar(int oldLevel, int newLevel) {
  int step = (newLevel > oldLevel) ? 1 : -1;   // Direction of sweep

  // Walk bar one position at a time toward new level
  for (int l = oldLevel; l != newLevel; l += step) {
    drawLine2(l);     // Redraw bar at intermediate level
    delay(35);        // 35ms per step → full 0→7 sweep takes 245ms
  }
}

// ================================================================
//  setup — runs once on power-on or reset
// ================================================================
void setup() {
  // Initialize I2C LCD (Wire.begin() is called internally by lcd.init())
  lcd.init();
  lcd.backlight();

  // Load custom characters into HD44780 CGRAM (must happen before lcd.clear())
  // Slots 0–7 are available; we use slots 0–4
  lcd.createChar(0, sunChar);    // Slot 0 — sun
  lcd.createChar(1, moonChar);   // Slot 1 — moon
  lcd.createChar(2, boltChar);   // Slot 2 — bolt (reserved for future use)
  lcd.createChar(3, halfBar);    // Slot 3 — half bar (reserved for future use)
  lcd.createChar(4, rungChar);   // Slot 4 — resistor icon

  // Show animated splash before entering the sensing loop
  splashScreen();
}

// ================================================================
//  loop — runs continuously; reads voltage and updates LCD
// ================================================================
void loop() {

  // --- Rate-limit: don't update faster than REFRESH_MS ---
  // millis() returns ms since boot; comparing deltas is overflow-safe.
  if (millis() - lastRefresh < REFRESH_MS) return;
  lastRefresh = millis();

  // --- Step 1: Read the LDR voltage at A6 ---
  // analogRead() is the ONLY valid read function for A6/A7 on Nano.
  // It returns 0 (0V) to 1023 (5V) relative to VREF_NANO.
  int raw = analogRead(LDR_VOLTAGE_PIN);

  // --- Step 2: Convert ADC count → voltage ---
  // formula: voltage = raw × (Vref / max_count)
  float voltage = raw * (VREF_NANO / 1023.0f);

  // --- Step 3: Map voltage to a 3-bit level (0–7) ---
  // Integer division by the step size gives the level bucket.
  // (V_CIRCUIT_MAX / N_LEVELS) = 3.3 / 8 = 0.4125V per level.
  // constrain() clamps to [0, 7] even if Vin slightly exceeds 3.3V.
  int level = constrain(
    (int)(voltage / (V_CIRCUIT_MAX / (float)N_LEVELS)),
    0,
    N_LEVELS - 1
  );

  // --- Step 4: Skip redraw if level hasn't changed ---
  // This prevents constant LCD writes which cause visible flicker.
  if (level == lastLevel) return;

  // --- Step 5: Animate bar sweep on level change ---
  // Visually shows which comparator thresholds are being crossed/released,
  // mirroring the thermometer code behavior inside the flash ADC circuit.
  if (lastLevel != -1) {
    sweepBar(lastLevel, level);
  }

  lastLevel = level;

  // --- Step 6: Final display update ---
  drawLine1(voltage, level);   // Top row: voltage + binary code + level number
  drawLine2(level);            // Bottom row: filled bar + brightness label
}

// ================================================================
//  Circuit Reference — SN74LS48N / LM339 IC configuration:
//
//  Resistor Ladder (3.3V rail → GND, 8 equal resistors):
//    Tap V1 = 0.4125V  → LM339 Comparator 1 (+IN)
//    Tap V2 = 0.825V   → LM339 Comparator 2 (+IN)
//    Tap V3 = 1.2375V  → LM339 Comparator 3 (+IN)
//    Tap V4 = 1.65V    → LM339 Comparator 4 (+IN)
//    Tap V5 = 2.0625V  → LM339 Comparator 5 (+IN)
//    Tap V6 = 2.475V   → LM339 Comparator 6 (+IN)
//    Tap V7 = 2.8875V  → LM339 Comparator 7 (+IN)
//    (All comparators share Vin from the LDR divider at –IN)
//
//  Comparator outputs → 74HC148 (8-to-3 Priority Encoder):
//    Thermometer code: e.g., Vin=1.5V → C1,C2,C3 HIGH, C4–C7 LOW
//    74HC148 encodes highest active input → 3-bit binary: 011 = level 3
//    74HC148 outputs A0,A1,A2 → binary code of brightness level
//
//  Note: 74HC148 uses ACTIVE LOW inputs/outputs — add inverters
//  (e.g., 74HC04 hex inverter) between LM339 and 74HC148 if needed
//  depending on LM339 output polarity configuration.
//
//  The Nano reads the LDR voltage directly for the LCD monitor. It
//  computes the displayed 0–7 level in software and does not read the
//  physical priority-encoder outputs. The flash-ADC hardware path is
//  still the comparator/encoder/decoder circuit described above.
//
//  Expected LCD output examples:
//    Dark room:     "0.21V [000] Lv:0"  /  "[        ]  DRK🌙"
//    Lamp light:    "1.45V [011] Lv:3"  /  "[|||     ]  SOFT"
//    Bright window: "2.55V [110] Lv:6"  /  "[||||||  ]  VVID"
//    Full sunlight: "3.12V [111] Lv:7"  /  "[|||||||]  SUN☀"
// ================================================================
