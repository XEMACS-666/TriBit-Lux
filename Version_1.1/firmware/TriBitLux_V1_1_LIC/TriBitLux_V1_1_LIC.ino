// Pin mapping
const int encoderPins[3] = {4,3,2};  // D2=O0 (LSB), D3=O1, D4=O2 (MSB)
const int segPins[7]     = {9, 10, 11, 12, 13, A0, A1}; // A-G segments
const int ldrPin = A2; // LDR voltage divider

// 7-segment encoding for digits 0-7
// segments: A B C D E F G (1=on, 0=off)
const byte segDigits[8][7] = {
  {1,1,1,1,1,1,0}, // 0
  {0,1,1,0,0,0,0}, // 1
  {1,1,0,1,1,0,1}, // 2
  {1,1,1,1,0,0,1}, // 3
  {0,1,1,0,0,1,1}, // 4
  {1,0,1,1,0,1,1}, // 5
  {1,0,1,1,1,1,1}, // 6
  {1,1,1,0,0,0,0}  // 7
};

void setup() {
  Serial.begin(9600);

  // Encoder output pins as input
  for(int i=0; i<3; i++){
    pinMode(encoderPins[i], INPUT);
  }

  // 7-segment pins as output
  for(int i=0; i<7; i++){
    pinMode(segPins[i], OUTPUT);
  }
}

void loop() {
  // Read encoder outputs (active LOW → invert them)
  int b0 = digitalRead(encoderPins[0]); // D2 = O0 (LSB)
  int b1 = digitalRead(encoderPins[1]); // D3 = O1
  int b2 = digitalRead(encoderPins[2]); // D4 = O2 (MSB)

  // Combine into 0–7 value
  int thermoCode = (b2 << 2) | (b1 << 1) | b0;

  // Display digit on 7-segment
  for(int i=0; i<7; i++){
    digitalWrite(segPins[i], segDigits[thermoCode][i]);
  }

  // --- Read LDR voltage ---
  int raw = analogRead(ldrPin); // 0-1023
  float voltage = (raw * 5.0) / 1023.0; // in volts

  // Debug output
  Serial.print("Encoder Code: ");
  Serial.print(thermoCode);
  Serial.print(" | Bits: ");
  Serial.print(b2); Serial.print(b1); Serial.print(b0);
  Serial.print(" | LDR Voltage: ");
  Serial.print(voltage, 2);
  Serial.println(" V");

  delay(200);
}