// Pin mapping
const int comparatorPins[7] = {2, 3, 4, 5, 6, 7, 8}; // C1 to C7
const int segPins[7]       = {9, 10, 11, 12, 13, A0, A1}; // A-G segments
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
  // Comparator pins as input
  for(int i=0; i<7; i++){
    pinMode(comparatorPins[i], INPUT);
  }
  // 7-segment pins as output
  for(int i=0; i<7; i++){
    pinMode(segPins[i], OUTPUT);
  }
}
void loop() {
  // Read thermometer code from comparators
  int thermoCode = 0;
  for(int i=0; i<7; i++){
    if(digitalRead(comparatorPins[i]) == HIGH){
      thermoCode = i + 1; // first HIGH determines the value
    }
  }

  // Limit value to 0-7
  if(thermoCode > 7) thermoCode = 7;

  // Display digit on 7-segment
  for(int i=0; i<7; i++){
    digitalWrite(segPins[i], segDigits[thermoCode][i]);
  }
}