/*********************************************************
* Daniel Wood
* 22/04/2016
* Project Car
*
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
* 
* MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
* Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with * bindings to javascript & python.
* Uses NodeJS module to enable real time communication between clients and the Galileo via a web browser to drive the car

**********************************************************/

/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

var mraa = require('mraa');  //mraa library
console.log('MRAA Version: ' + mraa.getVersion());

var servoModule = require("jsupm_servo");  //js ump servo library
var steeringServo = new servoModule.Servo(10);  //setup steering servo on Galileo pin 10
var cameraServo = new servoModule.Servo(11);  //setup camera servo on Galileo pin 11

var HBridge_lib = require('jsupm_l298');  //js ump L298N H-Bridge library
var myHBridge_obj = new HBridge_lib.L298(3, 4, 0);  //setup h bridge pins, (enable, direction a, direction b)

var rwLeds = new mraa.Gpio(13);  //red and white leds on galileo pin 13
var buzzer = new mraa.Gpio(12);  //buzzer on galileo pin 12
var rightIndLeds = new mraa.Gpio(8);  //steering right indicator leds on Galileo pin 8
var leftIndLeds = new mraa.Gpio(7);  //steering left indicator leds on Galileo pin 7

rwLeds.dir(mraa.DIR_OUT);  //red and white leds direction is output
buzzer.dir(mraa.DIR_OUT);  //buzzer direction is output
rightIndLeds.dir(mraa.DIR_OUT);  //steering right indicator leds direction is output
leftIndLeds.dir(mraa.DIR_OUT);  //steering left indicator leds direction is output

var speedControlState = true;  //state of speed control toggle, initially true
var ledState = false;  //state of leds, initially false
var PWM = 70;  //motor pwm speed, initially 70%
var frontPWM;  //front pwm value
var backPWM;  //back pwm value

var express = require('express');  //express module
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsersArray = [];  //array for number of connected users
var userId;

app.get('/', function(req, res)
{
    res.sendFile(path.join(__dirname + '/client', 'index.html'));  //load index.html from /client directory
});

//files required for client web page
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

//Socket.io Event handlers
io.on('connection', function(socket) {
    console.log("\n Add new User: u"+connectedUsersArray.length);
    if(connectedUsersArray.length > 0) {
        var element = connectedUsersArray[connectedUsersArray.length-1];
        userId = 'u' + (parseInt(element.replace("u", ""))+1);
    }
    else {
        userId = "u1";
    }
    console.log('a user connected: '+userId);
    io.emit('user connect', userId);
    connectedUsersArray.push(userId);
    console.log('Number of Users Connected ' + connectedUsersArray.length);
    console.log('User(s) Connected: ' + connectedUsersArray);
    io.emit('connected users', connectedUsersArray);
    
    sendPingDist();  //send ping distance function to update distance in sketch.js file
    
//Functions--------------------------------------------------------------------------
    socket.on('user disconnect', function() {  //for user disconnect
        console.log('remove: ' + msg);
        connectedUsersArray.splice(connectedUsersArray.lastIndexOf(msg), 1);
        io.emit('user disconnect', msg);
    });
    
    socket.on('toggle red white leds', function() {  //for toggling LEDs
        ledState =! ledState;  //invert LedToggle
        rwLeds.write(ledState?1:0);  //if LedToggle is true then write a '1' (high) otherwise write a '0' (low)
    });
    
    socket.on('toggle speed control', function() {  //for toggling LEDs
        speedControlState =! speedControlState;  // toggle state of leds
    });
    
    socket.on('motor forward', function() {  //for motor forward (up arrow key pressed)
        myHBridge_obj.forward();  //motor forwards
    });
    
    socket.on('motor backwards', function() {  //for motor backwards (down arrow pressed)
        myHBridge_obj.backwards();  //motor backwards
    });
    
    socket.on('motor stopped', function() {  //motor stopped (up/down arrow released)
        myHBridge_obj.stop();  //motor stopped
    });
    
    socket.on('steering left', function() {  //for steering left (left arrow key pressed)
        steeringServo.setAngle(180);  //change steering angle to 180° position
        leftIndLeds.write(1);  //turn on left side leds
    });
    
    socket.on('steering right', function() {  //for steering right (right arrow key pressed)
        steeringServo.setAngle(0);  //change steering right angle to 0° position
        rightIndLeds.write(1);  //turn on right side leds
    });
       
    socket.on('steering released', function() {  //for steering released (left/right arrow released)
        steeringServo.setAngle(90);  //return steering to 90° center position
        leftIndLeds.write(0);  //turn off left side leds
        rightIndLeds.write(0);  //turn off right side leds
    });
    
    socket.on('center camera', function() {  //for pressing center camera button
        cameraServo.setAngle(90);  //change camera servo angle to center position 90°
    });

    socket.on('camera slider', function(cameraAngle) {  //for camera slider
        console.log("Received Angle: "+cameraAngle);  //print out received camera slider angle
        cameraServo.setAngle(cameraAngle);  //update camera slider value
    });

    socket.on('pwm slider', function(pwmSliderVal) {  //for pwm motor speed slider  
        if(speedControlState === false) {
            console.log("Received PWM: "+pwmSliderVal);  //print out received pwm value
            PWM = pwmSliderVal;  //update pwm speed value
        }
    });

    socket.on('update values', function(topVal, btmVal) {  //for updating pwm speed values
        frontPWM = topVal;
        backPWM = btmVal;
    });

    socket.on('buzzer on', function() {  //for buzzer
        buzzer.write(1);  //turn on buzzer
    });

    socket.on('buzzer off', function() {  //for buzzer
        buzzer.write(0);  //turn off buzzer
    });
    
    myHBridge_obj.forward = function() {  //motor forward function
        if(speedControlState === true) {  //if speed control state is toggled on
            myHBridge_obj.setSpeed(frontPWM);  //use pwm speed value from front ping distance
        }
        else if(speedControlState === false) {  //if speed control state is toggled off
            myHBridge_obj.setSpeed(PWM);  //use pwm speed value from pwm slider
        }
        myHBridge_obj.setDirection(HBridge_lib.L298.DIR_CW); //motor direction forward
        myHBridge_obj.enable(true);
    };

    myHBridge_obj.backwards = function() {  //h brdige background
        if(speedControlState === true) {  //if speed control state is toggled on
            myHBridge_obj.setSpeed(backPWM);  //use pwm speed value from back ping distance
        }
        else if(speedControlState === false) {  //if speed control state is toggled off
            myHBridge_obj.setSpeed(PWM);  //use pwm speed value from pwm slider
        }
        myHBridge_obj.setDirection(HBridge_lib.L298.DIR_CCW);  //motor direction backward
        myHBridge_obj.enable(true);
    };
    
    myHBridge_obj.stop = function() {  //motor stopped function
        myHBridge_obj.setSpeed(0);
        myHBridge_obj.enable(false);  //disable h bridge enable pin
    };
  
    function sendPingDist() {  //read front and back ping distances from text file and send distances to sketch.js
        var fs = require('fs');  //require file system module
        var interval = setInterval(function () {
            var frontPingData = fs.readFileSync('/home/root/GetPing/FrontPing.txt','utf8');  //read front ping text file from linux and set to front ping data variable
            var backPingData = fs.readFileSync('/home/root/GetPing/BackPing.txt','utf8');  //read back ping text file from linux and set to back ping data variable
            var pingData = {front: frontPingData, back: backPingData};
            socket.emit("pingDist", pingData);  //send ping data to sketch.js
        }, 100);  //every 100ms
    }
});

http.listen(3000, function() {  //start server listening on port 3000
    console.log('Web server Active listening on *:3000'); //server ready message
    cameraServo.setAngle(90);  //change camera servo angle to center position 90°
    steeringServo.setAngle(90);  //change camera servo angle to center position 90°
});