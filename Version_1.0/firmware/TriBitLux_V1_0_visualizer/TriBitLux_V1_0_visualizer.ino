// ================================================================
//  7-Segment Display Visualizer — Arduino Nano
//  Reads SN74LS48N (BCD→7seg decoder) outputs f,g,a,b,c,d,e
//  mapped to analog pins A6 → A0, then draws the active digit
//  in the Serial Monitor as ASCII art (like a real 7-seg display).
//
//  SN74LS48N Output Logic: ACTIVE HIGH (logic 1 = segment ON)
//  Display Type Driven:    Common Cathode
//
//  Pin Mapping:
//    Segment  Arduino Pin   Notes
//    -------  -----------   -----------------------------------
//      f      A6            ⚠ ANALOG-ONLY on Nano — uses analogRead()
//      g      A5            Digital-capable
//      a      A4            Digital-capable
//      b      A3            Digital-capable
//      c      A2            Digital-capable
//      d      A1            Digital-capable
//      e      A0            Digital-capable
//
//  7-Segment layout reference:
//        _
//       |_|     <- segments: a(top), f(top-left), g(mid), b(top-right)
//       |_|     <- segments: e(bot-left), d(bot), c(bot-right)
//
//  ASCII art output per frame (in Serial Monitor):
//        _
//       | |     (for digit '0')
//       |_|
// ================================================================

// --- Pin Definitions -----------------------------------------
// A6 and A7 on Arduino Nano are ANALOG-ONLY pins.
// They cannot be configured with pinMode() or read with digitalRead().
// Only analogRead() works on A6/A7.
#define PIN_F  A6   // Segment f -- top-left vertical   (ANALOG-ONLY)
#define PIN_G  A5   // Segment g -- middle horizontal
#define PIN_A  A4   // Segment a -- top horizontal
#define PIN_B  A3   // Segment b -- top-right vertical
#define PIN_C  A2   // Segment c -- bottom-right vertical
#define PIN_D  A1   // Segment d -- bottom horizontal
#define PIN_E  A0   // Segment e -- bottom-left vertical

// --- Threshold for Analog -> Logic conversion -----------------
// analogRead() returns 0-1023.
// VCC/2 = 2.5V -> ~512 counts.
// Any reading above this midpoint is treated as logic HIGH.
// Adjust lower (e.g. 400) if your 74LS48 HIGH level is weak.
#define ANALOG_THRESHOLD  512

// --- Display refresh rate ------------------------------------
// How often the Serial Monitor updates (milliseconds).
// 200ms = ~5 frames/sec. Lower = faster but more serial traffic.
#define REFRESH_MS  200

// ================================================================
//  Helper: readDig -- reads a standard digital-capable analog pin.
//  Returns true  if the pin is pulled HIGH by the 74LS48 output.
//  Returns false if the pin is LOW (segment OFF).
// ================================================================
bool readDig(uint8_t pin) {
  return digitalRead(pin) == HIGH;
}

// ================================================================
//  Helper: readAnlg -- reads A6 (analog-only pin) by comparing
//  its raw ADC count against the midpoint threshold.
//  Returns true  (HIGH) if ADC value > ANALOG_THRESHOLD.
//  Returns false (LOW)  otherwise.
// ================================================================
bool readAnlg(uint8_t pin) {
  return analogRead(pin) > ANALOG_THRESHOLD;
}

// ================================================================
//  Helper: segChar -- returns the display character for a segment.
//  seg      : boolean state of the segment (true = ON)
//  onChar   : character to print when segment is ON  (e.g. '_' or '|')
//  offChar  : character to print when segment is OFF (usually ' ')
// ================================================================
char segChar(bool seg, char onChar, char offChar) {
  return seg ? onChar : offChar;
}

// ================================================================
//  setup() -- runs once at power-on / reset
// ================================================================
void setup() {
  Serial.begin(9600);   // Open serial port at 9600 baud

  // Configure A0-A5 as INPUT.
  // No internal pull-up needed -- the SN74LS48N actively drives HIGH/LOW.
  // A6 is analog-only, so we intentionally skip it here.
  pinMode(PIN_G, INPUT);  // A5
  pinMode(PIN_A, INPUT);  // A4
  pinMode(PIN_B, INPUT);  // A3
  pinMode(PIN_C, INPUT);  // A2
  pinMode(PIN_D, INPUT);  // A1
  pinMode(PIN_E, INPUT);  // A0

  // Print a startup banner to Serial Monitor
  Serial.println(F("========================================"));
  Serial.println(F("  SN74LS48N -> 7-Seg ASCII Visualizer  "));
  Serial.println(F("  f->A6  g->A5  a->A4  b->A3            "));
  Serial.println(F("  c->A2  d->A1  e->A0                   "));
  Serial.println(F("========================================"));
  Serial.println();
}

// ================================================================
//  loop() -- runs continuously; reads pins and draws the display
// ================================================================
void loop() {

  // -- Step 1: Read all 7 segment lines -----------------------
  // Each variable is true (1) if the SN74LS48N is asserting that
  // segment HIGH (i.e., that segment should be lit).

  bool seg_a = readDig(PIN_A);   // Top horizontal bar
  bool seg_b = readDig(PIN_B);   // Top-right vertical bar
  bool seg_c = readDig(PIN_C);   // Bottom-right vertical bar
  bool seg_d = readDig(PIN_D);   // Bottom horizontal bar
  bool seg_e = readDig(PIN_E);   // Bottom-left vertical bar
  bool seg_f = readAnlg(PIN_F);  // Top-left vertical bar  (A6 analog-only)
  bool seg_g = readDig(PIN_G);   // Middle horizontal bar

  // -- Step 2: Build and print ASCII art ----------------------
  //
  // The 3-line ASCII layout maps to segments like this:
  //
  //   Line 1:  " _ "   ->  space, a, space
  //   Line 2:  "|_|"   ->  f,     g, b
  //   Line 3:  "|_|"   ->  e,     d, c
  //
  // segChar() selects the correct character based on segment state.

  Serial.println();  // Blank line to visually separate each frame

  // Line 1 -- Top segment (a)
  Serial.print(' ');
  Serial.print(segChar(seg_a, '_', ' '));   // '_' if a is ON, space if OFF
  Serial.println(' ');

  // Line 2 -- Upper body (f, g, b)
  Serial.print(segChar(seg_f, '|', ' '));   // '|' if f ON (top-left)
  Serial.print(segChar(seg_g, '_', ' '));   // '_' if g ON (middle)
  Serial.println(segChar(seg_b, '|', ' ')); // '|' if b ON (top-right)

  // Line 3 -- Lower body (e, d, c)
  Serial.print(segChar(seg_e, '|', ' '));   // '|' if e ON (bottom-left)
  Serial.print(segChar(seg_d, '_', ' '));   // '_' if d ON (bottom)
  Serial.println(segChar(seg_c, '|', ' ')); // '|' if c ON (bottom-right)

  // -- Step 3: Optional -- print segment states for debugging -
  // Uncomment the block below to see raw HIGH/LOW states per pin.
  /*
  Serial.print(F("  [a="));  Serial.print(seg_a);
  Serial.print(F(" b="));    Serial.print(seg_b);
  Serial.print(F(" c="));    Serial.print(seg_c);
  Serial.print(F(" d="));    Serial.print(seg_d);
  Serial.print(F(" e="));    Serial.print(seg_e);
  Serial.print(F(" f="));    Serial.print(seg_f);
  Serial.print(F(" g="));    Serial.print(seg_g);
  Serial.println(F("]"));
  */

  // -- Step 4: Wait before next frame -------------------------
  delay(REFRESH_MS);
}

// ================================================================
//  Expected ASCII output per BCD digit (SN74LS48N truth table):
//
//  Digit  a  b  c  d  e  f  g    ASCII
//  -----  -  -  -  -  -  -  -    -----
//    0    1  1  1  1  1  1  0     _
//                               | |
//                               |_|
//
//    1    0  1  1  0  0  0  0
//                                 |
//                                 |
//
//    2    1  1  0  1  1  0  1     _
//                                _|
//                               |_
//
//    3    1  1  1  1  0  0  1     _
//                                _|
//                                _|
//
//    4    0  1  1  0  0  1  1
//                               |_|
//                                 |
//
//    5    1  0  1  1  0  1  1     _
//                               |_
//                                _|
//
//    6    1  0  1  1  1  1  1     _
//                               |_
//                               |_|
//
//    7    1  1  1  0  0  0  0     _
//                                 |
//                                 |
//
//    8    1  1  1  1  1  1  1     _
//                               |_|
//                               |_|
//
//    9    1  1  1  1  0  1  1     _
//                               |_|
//                                _|
// ================================================================
