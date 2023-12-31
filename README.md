# plantBuddy
A one stop shop into my house wirelessly - aka. a plant monitoring system

This project uses an arduino IoT kit for monitoring my plants soil moisture, ambient temperature and ambient humidity. Latest readings are displayed on locally hosted web-page.

## Current Features
- publish data using Arduino mkr IoT 1010 using public mqtt server
- subscribe to the data using subscriber.js script
- parse the incoming data from mqtt broker and upload it to "mqttData.json"
- send the data to cloud based aws server host => SingleStore
- local express server to read and send data from aws to html
- inject open api's ai comment into aws hosted db (SQL)
- pull ai comment and readings into html using local express server
- local web page to display readings + ai comment for latest readings

## Api keys
The overall project was designed with a ".env" file to store api keys
- keys required for: OpenAi & SingleStore 

### Run instructions 
- ((ensure package.json file has type: "module",))

- navigate to project folder on terminal
- npm init
- npm install npm install mqtt, fs, openai, dotenv, express, cors, node-fetch    
- npm install --save mysql2
- run -> node subscriber.js -> sub to topic + send data to aws db
- run -> commentUpdater.js -> to inject an ai generated comment into the db
- run -> node server.js -> setup local express server to read from aws db
