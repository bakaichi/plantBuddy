# plantBuddy
A one stop shop into my house wirelessly - aka. a plant monitoring system

This project uses an arduino IoT kit for monitoring my plants moisture, ambient temperature, light levels and ambient humidity. 


## Run instructions 
- navigate to project folder on terminal
- run npm init
- npm install mqtt
- npm install --save mysql2
- node subscriber.js -> sub to topic + send data to aws db 