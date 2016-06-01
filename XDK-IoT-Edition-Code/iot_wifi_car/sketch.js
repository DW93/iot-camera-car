var ledState = false;  //led toggle, initially off(false)
var pingSpeedState = true;  //ping distance controlled speed toggle, initailly off(false)
var hornState = false;  //horn pressed state, initially off (false)

var cameraSlider;  //setup slider for camera rotation angle
var pwmSlider;  //setup for pwm slider value
var pwmSliderVal = 70;  //pwm motor speed percentage, initially 100%
var frontPing = 0;  //front ping cm value for displaying text, initially 0 at program startup so not undefined
var backPing = 0;  //back ping cm value for displaying text, initially 0 at program startup so not undefined

var cameraServoAngle = 90;  //value for camera servo angle, initially 90° (centered)

var upArrowColour = (255);  //colour fill for up arrow, initially white
var downArrowColour = (255);  //colour fill for down arrow, initially white
var leftArrowColour = (255);  //colour fill for left arrow, initially white
var rightArrowColour = (255);  //colour fill for right arrow, initially white

var leftSteeringColour = (255);  //colour fill for left steering indicator, initially white
var rightSteeringColour = (255);  //colour fill for right steering indicator, initially white

var topHalfColour;  //colour variable for top half colour of sketch
var bottomHalfColour;  //colour variable for bottom half colour of sketch

var ledStateColour = (255);  //colour fill for led toggle circle, initially white
var pingSpeedStateColour = (0,255,0);  //colour fill for speed toggle circle, initially green
var hornStateColour = (255);  //colour fill for horn press circle, initially white

var socket = io();
var userId = "user";

function setup() {  //setup function, runs once
    createCanvas(850,660);  //setup canvas size, 850 x 660 pixels
    buttonSetup();  //setup buttons
    sliderSetup();  //setup sliders
}  //end of setup

function draw() {  //draw function, loops
    findColour();  //find top and bottom background colour of sketch
    drawController();  //draw controller sketch
    drawText();  //draw the text on sketch
}  //end of draw

function drawController() {  //draws controller sketch
    background(200);  //fill background grey
    fill(topHalfColour);  //fill colour for top half of background
    rect(0,0,690,330);  //rectangle for top half of background (start at 0x,0y , size 690x,330y)
    fill(bottomHalfColour);  //fill colour for bottom half of background
    rect(0,330,690,330);  //rectangle for bottom half of background (start at 0x,330y , size 690x,330y)
    fill(255);  //fill white
    rect(25,25,640,480);  //rectangle for camera (start at 25x,25y , size 640x,480y)
    fill(200);  //fill grey
    rect(25,535,640,100);  //rectangle for controller near bottom with arrows (start at 25x,535y , size 640x,100y)

    fill(upArrowColour);  //fill colour of up arrow
    triangle(330,575,360,575,345,545);  //up arrow, triangle((left x,y),(right x,y),(top x,y))
    fill(downArrowColour);  //fill colour of down arrow
    triangle(330,595,360,595,345,625);  //down arrow, triangle((left x,y),(right x,y),(down x,y))
    fill(leftArrowColour);  //fill colour of left arrow
    triangle(315,570,315,600,280,585);  //left arrow, triangle((top x,y),(bottom x,y),(left x,y))
    fill(rightArrowColour); //fill colour of right arrow
    triangle(375,570,375,600,410,585);  //right arrow, triangle(top x,y),(bottom x,y),(right x,y)              //check this one

    fill(ledStateColour);  //fill colour of led state indicator
    ellipse(50,560,25,25);  //ellipse for left led
    ellipse(640,560,25,25);  //ellipse for right led

    fill(leftSteeringColour);  //fill colour of left steering indicator
    ellipse(50,560,15,15);  //ellipse for left steering indicator
    fill(rightSteeringColour);  //fill colour of right steering indicator
    ellipse(640,560,15,15);  //ellipse for right steering indicator

    fill(hornStateColour);  //fill colour of horn indicator
    ellipse(810,520,15,15);  //ellipse for horn indicator

    fill(pingSpeedStateColour);  //fill colour of ping speed state indicator
    ellipse(820,482,15,15);  //ellipse for ping speed state indicator  
}  //end of drawController

function drawText() {  //draw text on sketch
    fill(0);  //black text
    textSize(30);  //size 30 text
    text("Loading Camera", 240, 270);  //240x,270y
    textSize(24);  //size 24 text
    text("Buttons", 730, 60);  //730x,60y
    textSize(14);  //size 14 text
    text("Front Ping Distance: " + frontPing + "cm", 50, 595);  //front ping distance text with frontPing variable at 50x,595y
    text("Back Ping Distance: " + backPing + "cm", 50, 620);  //front ping distance text with backPing variable at 50x,620y
    text("Camera Angle: " + cameraServoAngle + "°", 480, 560);  //camera angle text with cameraServoAngle variable at 480x,560y

    if (ledState === true) {
        text("LEDs (L): On", 700, 563);  //700x,563y
    } 
    else if (ledState === false) {
        text("LEDs (L): Off", 700, 563);  //700x,563y
    }

    if (hornState === true) {
        text("Horn (H): On", 700, 523);  //700x,523y
    }
    else if (hornState === false) {
        text("Horn (H): Off", 700, 523);  //700x,523y
    }

    text("PWM Distance Speed", 700, 467);  //700x,467y
    if (pingSpeedState === true) {
        text("Control (S): On", 700, 483);  //700x,483y
    }
    else if (pingSpeedState === false) {
        text("Control (S): Off", 700, 483);  //700x,483y
    }

    text("PWM: " + pwmSliderVal + "%", 480, 600);  //pwm text with pwmSliderVal variable at 480x,600y
    textSize(10); //size 10 text
    text("Minimum PWM % to drive = 40%", 480, 630);  //480x,630y    
}  //end of drawText

function findColour() {  //find background colours of sketch
    var topVal;  //top value
    var topR;  //top red
    var topG;  //top green
    var topB;  //top blue
    var btmVal;  //bottom value
    var btmR;  //bottom red
    var btmG;  //bottom green
    var btmB;  //bottom blue

    topVal = constrain(frontPing, 0, 100);  //top value = constrain front ping distance between 0 and 100
    topR = (255 * (100 - topVal)) / 100;  //top red calculation
    topG = (255 * topVal) / 100;  //top green calculation
    topB = 0;  //top blue = 0
    topHalfColour = color(topR, topG, topB);  //set topHalfColour

    btmVal = constrain(backPing, 0, 100);  //bottom value = constrain front ping distance between 0 and 100
    btmR = (255 * (100 - btmVal)) / 100;  //bottom red calculation
    btmG = (255 * btmVal) / 100;  //bottom green calculation
    btmB = 0;  //bottom blue = 0
    bottomHalfColour = color(btmR, btmG, btmB);  //set bottomHalfColour
    
    if(pingSpeedState === true) {
        socket.emit('update values', topVal, btmVal);
    }
}  //end of findColour

function keyPressed() {  //keyPressed function for non ASCII keys
    if (keyCode === UP_ARROW) {  //if up arrow is pressed
        socket.emit('motor forward');  //activate motor forward function in main.js
        upArrowColour = 'rgb(0,255,0)';  //up arrow colour green
    }
    else if (keyCode === DOWN_ARROW) {  //if down arrow is pressed
        socket.emit('motor backwards');  //activate motor backwards function in main.js
        downArrowColour = 'rgb(0,255,0)';  //down arrow colour green
    }
    else if (keyCode === LEFT_ARROW) {  //if left arrow is pressed
        socket.emit('steering left');  //activate steering left function in main.js
        leftArrowColour = 'rgb(0,255,0)';  //left arrow colour green
        leftSteeringColour = 'rgb(255, 191, 0)';  //left steering indicator colour amber
    }
    else if (keyCode === RIGHT_ARROW) {  //if right arrow is pressed
        socket.emit('steering right');  //activate steering right function in main.js
        rightArrowColour = 'rgb(0,255,0)';  //right arrow colour green
        rightSteeringColour = 'rgb(255, 191, 0)';  //right steering indicator colour amber
    }
}  //end of keyPressed

function keyTyped() {  //keyTyped function for ASCII keys
    switch(key) {
        //front white and back red leds
        case 'l':  //lowercase
        case 'L':  //uppercase
            ledState =! ledState;  //toggle led state
            socket.emit('toggle red white leds');  //activate steering right function in main.js
            if (ledState === true) {
                ledStateColour = 'rgb(0,255,0)';  //led toggle colour green
            }
            else if (ledState === false) {
                ledStateColour = '(0)';  //led toggle colour red
            }
            break;

        //ultrasonic distance pwm speed control
        case 's':  //lowercase
        case 'S':  //uppercase
            pingSpeedState =! pingSpeedState;  //toggle ping speed state
            socket.emit('toggle speed control');  //activate toggle speed control function in main.js
            if (pingSpeedState === true) {
                pingSpeedStateColour = 'rgb(0,255,0)';  //ping speed state colour green
            }
            else if (pingSpeedState === false) {
                pingSpeedStateColour = 'rgb(255,0,0)';  //ping speed state colour red
            }
            break;

        //horn
        case 'h':  //lowercase
        case 'H':  //uppercase
            hornState = true;
            socket.emit('buzzer on');  //activate buzzer on function in main.js
            hornStateColour = 'rgb(0,255,0)';  //horn state colour green
            break;

        case ' ':  //spacebar, stop motor using h bridge brake function
            socket.emit('motor stopped');
            upArrowColour = 'rgb(255,0,0)';  //up arrow colour red
            downArrowColour = 'rgb(255,0,0)';  //down arrow colour red
            break;

        default:
            return false;
    }
}  //end of keyTyped

function keyReleased() {  //keyReleased function for when keys are released
    socket.emit('motor stopped');  //activate turn off motor function in main.js
    socket.emit('steering released');  //activate set steering to center position function in main.js
    socket.emit('buzzer off');  //activate turn horn off function in main.js
    
    upArrowColour = (255);  //change colour of up arrow to white
    downArrowColour = (255);  //change colour of down arrow to white
    leftArrowColour = (255);  //change colour of left arrow to white
    rightArrowColour = (255);  //change colour of right arrow to white
    leftSteeringColour = (255);  //change colour of left steering circle to white
    rightSteeringColour = (255);  //change colour of right steering circle to white

    hornState = false;  //horn state false
    hornStateColour = 'rgb(255,0,0)';  //change horn state colour to red
}  //end of keyReleased

function sliderSetup() {  //setup camera angle and pwm value sliders
    cameraSlider = createSlider(0, 180, 90);  //slider called cameraSlider, (minimum 0, maximum 180, initial value 90)
    cameraSlider.position(25, 508);  //position of slider
    cameraSlider.style('width', '640px');  //width of slider

    pwmSlider = createSlider(0, 100, pwmSliderVal);  //slider called CameraSlider, (minimum 0, maximum 100, initial value 70)
    //pwmSlider = createSlider(0, 100, 70);  //slider called CameraSlider, (minimum 0, maximum 100, initial value 70)
    pwmSlider.position(450, 600);  //position of slider
    pwmSlider.style('width', '200px');  //width of slider
}

function mouseReleased() {  //function for mouse press released
    cameraServoAngle = cameraSlider.value();  //update camera angle slider value
    sendCameraAngle(cameraServoAngle);  //call send camera angle function

    pwmSliderVal = pwmSlider.value();  //update pwm slider value
    sendPWM(pwmSliderVal);  //call send PWM function
}

function sendCameraAngle(cameraServoAngle) {  //send camera angle function
    socket.emit('camera slider', cameraServoAngle);  //send camera servo angle to main.js
}

function sendPWM(pwmSliderVal) {  //send pwm function
    socket.emit('pwm slider', pwmSliderVal);  //send pwm slider value to main.js
}

function buttonSetup() {  //button setup function
    //button text
    centerCameraButton = createButton('Center Camera'); //button for centering camera servo
    openImageButton = createButton('Open Camera Image'); //button for opening camera view as an image

    //button positions
    centerCameraButton.position(700, 100); //location of center camera button
    openImageButton.position(700, 140); //location of open image button

    //functions called when button pressed
    centerCameraButton.mousePressed(centerCam); //center camera button pressed, centerCam function
    openImageButton.mousePressed(openIMG); //open image button pressed, openIMG function
}

//button functions
function centerCam() {  //center camera button function              
    socket.emit('center camera');  //activate function to move camera servo to center position
    cameraSlider.value(90);  //move slider to position 90 (center)
}

function openIMG() {  //open image button function
    window.open('http://192.168.1.108:8090/?action=snapshot');  //open camera stream as a single image in new tab, user can right click and save image
}

socket.on('pingDist', function(pingData) {  //on ping distance function, receiving pingData variables
    frontPing = pingData.front;  //update front ping distance
    backPing = pingData.back;  //update back ping distance
});