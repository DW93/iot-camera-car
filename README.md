# IoT-Camera-Car
Internet of Things Wi-Fi Controlled Remote Control Car using the Intel Galileo Gen 2 development board.

This code is for Wi-Fi remote control car project using Intel Galileo Gen 2 development board with the Yocto IoT image, and a connected Wi-Fi card and USB UVC webcam.
The hardware consists of a remote control car with DC motor, servo motor steering and a servo motor to rotate the camera, 2 ultrasonic distance sensors and 4 led modules.

The XDK code starts the node.js server running on the galileo and displays the index.html controller page to clients.

The Ardunio sketch reads the ultrasonic distance sensors and writes the distances to files that are read by the XDK code, the arduino code also displays the distances on an LCD.

![Alt text](http://i.imgur.com/pVadyv3.jpg "Completed Project")


http://imgur.com/Y8ZYmaM
