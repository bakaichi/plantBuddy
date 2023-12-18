const fs = require('fs');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io');
const topic = '/bakaichi/plantBuddy'; // your topic id /id/topicName

client.on('connect', function(){
    client.subscribe(topic, function (err){
        if (!err) {
            console.log(`Successfully subscribed to ${topic}`);
        }
    })
})

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

client.on('message', function (topic, message) {
    let messageStr = message.toString();
    messageStr = cleanMessageString(messageStr);

    console.log('Received MQTT message:', messageStr);

    if (!isValidJSONString(messageStr)) {
        console.error('Invalid JSON received:', messageStr);
        return;
    }

    try {
        const data = JSON.parse(messageStr); // Parse incoming JSON message

        // Read the existing file content if it exists, otherwise initialize an empty object
        let content = {};
        try {
            content = JSON.parse(fs.readFileSync('mqttData.json'));
        } catch (error) {
            console.error('Error reading file:', error);
        }

        // Check if the deviceID exists in the content, create an array if it doesn't
        if (!content.hasOwnProperty(data.deviceID)) {
            content[data.deviceID] = { readings: [] };
        }

        // Add new reading to the respective device's readings array
        content[data.deviceID].readings.push({
            temp: data.temp,
            humidity: data.humidity,
            moisture: data.moisture,
            timestamp: data.timestamp
        });

        // Write the updated content back to the file
        fs.writeFile('mqttData.json', JSON.stringify(content, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Data was written to mqttData.json successfully');
            }
        });
    } catch (err) {
        console.error('Error processing MQTT message:', err);
    }
});
