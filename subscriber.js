import fs from 'fs';
import mysql from 'mysql2/promise';
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.emqx.io');
const topic = '/bakaichi/plantBuddy'; // Your MQTT topic

const HOST = 'svc-52994ce9-bc4c-48f7-bf26-0a51c1d63461-dml.aws-ireland-2.svc.singlestore.com';
const USER = 'admin';
const PASSWORD = 'v9Fmbz06jgSZ5wxRO10AjttHaJcbm2Wt';
const DATABASE = 'plantbuddy';

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

        // Insert received MQTT data into SingleStore database
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

// Utility functions
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
