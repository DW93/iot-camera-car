/* Internet of things wifi camera car
 * 02/04/2016
 * 
 * This code gets the distance in centimeters of two ultrasonic distance sensors and places the value into two text files on the linux side of the system,
 * and also opens a text file on the linux system and reads the Galileo's IP address and displays it on the LCD.
 *
 * Arduino Pins (~ is a pwm pin)
 * Pins(ARD = pins being used by arduino sketch, XDK = pins being used by XDK code)
 *  19(AD5) - ARD - LCD Enable
 *  18(AD4) - ARD - LCD RS
 *  17(AD3) - ARD - LCD D7
 *  16(AD2) - ARD - LCD D6
 *  15(AD1) - ARD - LCD D5
 *  14(AD0) - ARD - LCD D4
 *  13 - XDK - White and Red LEDs
 *  12 - XDK - Buzzer
 *  11 ~ XDK - Camera Servo Motor
 *  10 ~ XDK - Steering Servo Motor
 *  09 ~ ARD - Ping Ultrasonic Distance Sensor - Front - (Output With 1k Resistor)
 *  08 - XDK - Right LEDs
 *  07 - XDK - Left LEDs
 *  06 ~ ARD - Ping Ultrasonic Distance Sensor - Back - (Input No Resistor)
 *  05 ~ ARD - Ping Ultrasonic Distance Sensor - Back -  (Output With 1K Resistor)
 *  04 - XDK - H Bridge Input A
 *  03 ~ XDK - H Bridge Enable
 *  02 - (Not Used)
 *  01 - ARD - Ping Ultrasonic Distance Sensor - Front - (Input No Resistor)
 *  00 - XDK - H Bridge Input B
 */

#include <LiquidCrystal.h>

LiquidCrystal lcd(18, 19, 14, 15, 16, 17);  //setup lcd pins, using analog A0-A5 pins / (digital pins 14 to 19)
               //(RS,  E, D4, D5, D3, D2) 

const int FRONT_PING_IN = 1;  //ping sensor - front - input pin with no resistor
const int FRONT_PING_OUT = 9; //ping sensor - front - output pin with 1k resistor
const int BACK_PING_IN = 6;   //ping sensor - back - input pin with no resistor
const int BACK_PING_OUT = 5;  //ping sensor - back - output pin with 1k resistor

void setup()
{
  //setup ultrasonic distance sensor pins, needs to be INPUT_FAST / OUTPUT_FAST to use on Galileo
  pinMode(FRONT_PING_IN, INPUT_FAST);
  pinMode(FRONT_PING_OUT, OUTPUT_FAST);
  pinMode(BACK_PING_IN, INPUT_FAST);
  pinMode(BACK_PING_OUT, OUTPUT_FAST);

  //Setup pins being used by the arduino sketch and the xdk app
  pinMode(19, OUTPUT);  //LCD Enable
  pinMode(18, OUTPUT);  //LCD Rs
  pinMode(17, OUTPUT);  //LCD D7
  pinMode(16, OUTPUT);  //LCD D6
  pinMode(15, OUTPUT);  //LCD D5
  pinMode(14, OUTPUT);  //LCD D4
  pinMode(13, OUTPUT);  //Front and back LEDs
  pinMode(12, OUTPUT);  //Buzzer
  pinMode(8, OUTPUT);   //Right LEDs
  pinMode(7, OUTPUT);   //Left LEDs
  pinMode(4, OUTPUT);   //H Bridge Input B
  pinMode(3, OUTPUT);   //~H Bridge Enable
  pinMode(0, OUTPUT);   //H Bridge Input A
  
  lcd.begin(16, 2);

  getIP();
}

void loop()
{
  frontPing();
  backPing();
}

void frontPing()   //Function for Front Ping Ultrasonic Distance Sensor
{
  long front_duration;   //variable for duration of front ping
  int front_cm;         //variable for distance of front ping in centimeters

  fastDigitalWrite(FRONT_PING_OUT, LOW);
  waitMicros(2);
  fastDigitalWrite(FRONT_PING_OUT, HIGH);
  waitMicros(10);
  fastDigitalWrite(FRONT_PING_OUT, LOW);
  front_duration = pulseIn(FRONT_PING_IN, HIGH); // calls fastGpioPciDigitalRead
  front_cm = microsecondsToCentimeters(front_duration);
  
  FILE *data;
  data = fopen("/home/root/GetPing/FrontPing.txt","w");  //location of text file on linux, w = write to file
  if(data!=NULL)
  {
    fprintf(data, "%d", front_cm); //place FrontCM variable into file
    fclose(data); //close file
  }
    
  lcd.setCursor(0, 0);
  lcd.print("Front Ping: ");
  lcd.print(front_cm);
  lcd.print("cm");
  
  delay(100);
}

long backPing()   //Function for Back Ping Ultrasonic Distance Sensor
{
  long back_duration;    //variable for duration of back ping
  int back_cm;          //variable for distance of back ping in centimeters
  
  fastDigitalWrite(BACK_PING_OUT, LOW);
  waitMicros(2);
  fastDigitalWrite(BACK_PING_OUT, HIGH);
  waitMicros(10);
  fastDigitalWrite(BACK_PING_OUT, LOW);
  back_duration = pulseIn(BACK_PING_IN, HIGH);
  back_cm = microsecondsToCentimeters(back_duration);
  
  FILE *data;
  data = fopen("/home/root/GetPing/BackPing.txt","w");  //location of text file on linux, w = write to file
  if(data!=NULL)
  {
    fprintf(data, "%d", back_cm);  //place BackCM variable into file
    fclose(data); //close file
  }
  
  lcd.setCursor(0, 1);
  lcd.print("Back Ping: ");
  lcd.print(back_cm);
  lcd.print("cm");
  
  delay(100);
}

void waitMicros(int val)
{
  unsigned long a = micros();
  unsigned long b = micros();
  while((b-a) < val)
  {
    b = micros();
    if(a>b)
    {
      break;
    }
  }
}

long microsecondsToCentimeters(long microseconds)
{
  return microseconds / 29 / 2;
}

void getIP()  //function to get Galileo IP Address
{
  lcd.setCursor(0, 0);
  lcd.print("Server Setup"); //display connect to message on lcd
  lcd.setCursor(0, 1);
  lcd.print("Please wait: ");
  int i;
  for(i=41; i>0; i--)  //delay that updates the countdown on the lcd until the web server is ready
  {
    lcd.setCursor(13, 1);
    lcd.print(i); //print time
    delay(1000);  //delay 1 second
  }
  
  char ip_raw[16];  //store ip address
  FILE *fp;
  fp = fopen("/home/root/GetIP/ip.txt", "r"); //open and read ip.txt file in linux filesystem, r = read file
  fgets(ip_raw, 17, fp);
  fclose(fp);
  
  lcd.setCursor(0, 0);
  lcd.print("Server Ready"); //display server ready message on lcd
  lcd.setCursor(0, 1);
  lcd.print(ip_raw);  //display ip address
  delay(10000);  //10 sec delay
}
