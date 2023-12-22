# plantBuddy
A one stop shop into my house wirelessly - aka. a plant monitoring system

This project uses an arduino IoT kit for monitoring my plants moisture, ambient temperature, light levels and ambient humidity. 

## Current Features
- publish data using Arduino mkr IoT 1010
- subscribe to the data using subscriber.js script
- parse the incoming data from mqtt broker and upload it to     mqttData.json
- send the data to cloud based aws server host => SingleStore
- display latest readings via html

## Run instructions 
- navigate to project folder on terminal
- run npm init
- npm install mqtt
- npm install --save mysql2
- node subscriber.js -> sub to topic + send data to aws db 