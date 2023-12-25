/* This script is responsible for subscribing to a mqtt broker, retrieving the data,
parsing it into correct JSON format, loading the data into a separate file & lastly publishing it
to a aws cloud based db */

import fs from 'fs';
import mysql from 'mysql2/promise';
import mqtt from 'mqtt';
import 'dotenv/config';

const client = mqtt.connect('mqtt://broker.emqx.io');
const topic = '/bakaichi/plantBuddy'; // Your MQTT topic

// single store sql db setup
const HOST = process.env.DB_HOST;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const DATABASE = process.env.DB_DATABASE;

// insert fetched data into singlestore db
async function create({ singleStoreConnection, temp, humidity, moisture, timestamp }) {
    const [results] = await singleStoreConnection.execute(
        'INSERT INTO plant_readings (temp, humidity, moisture, timestamp) VALUES (?, ?, ?, ?)',
        [temp, humidity, moisture, timestamp]
    );
    return results.insertId;
}

client.on('connect', function(){
    client.subscribe(topic, function (err){
        if (!err) {
            console.log(`Successfully subscribed to ${topic}`);
        }
    })
})

// sending data from mqtt to single store sql table

client.on('message', async function (topic, message) {
    let messageStr = message.toString();
    messageStr = cleanMessageString(messageStr);

    console.log('Received MQTT message:', messageStr);

    if (!isValidJSONString(messageStr)) {
        console.error('Invalid JSON received:', messageStr);
        return;
    }

    try {
        const data = JSON.parse(messageStr); // Parse incoming JSON message

        // Write received MQTT data to mqttData.json file
        writeDataToFile(data);

        const singleStoreConnection = await mysql.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE
        });

        await create({
            singleStoreConnection,
            temp: data.temp,
            humidity: data.humidity,
            moisture: data.moisture,
            timestamp: data.timestamp
        });

        await singleStoreConnection.end();
        console.log('Inserted new reading into the database');
    } catch (err) {
        console.error('Error processing MQTT message:', err);
    }
});

// checking if data is in valid JSON format
function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function cleanMessageString(str) {
    // Remove any unwanted characters at the end of the string
    return str.replace(/[^\x20-\x7E]+$/, '');
}

function writeDataToFile(data) {
    try {
        let content = {};
        try {
            content = JSON.parse(fs.readFileSync('mqttData.json'));
        } catch (error) {
            console.error('Error reading file:', error);
        }

        if (!content.hasOwnProperty('plantBuddy')) {
            content['plantBuddy'] = { readings: [] };
        }

        content['plantBuddy'].readings.push({
            temp: data.temp,
            humidity: data.humidity,
            moisture: data.moisture,
            timestamp: data.timestamp
        });

        fs.writeFile('mqttData.json', JSON.stringify(content, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Data was written to mqttData.json successfully');
            }
        });
    } catch (err) {
        console.error('Error writing data to file:', err);
    }
}
