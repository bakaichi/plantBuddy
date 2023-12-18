#include <WiFiNINA.h>
#include <PubSubClient.h>
#include <Arduino_MKRIoTCarrier.h>
#include <ArduinoJson.h>

// wifi setup 
MKRIoTCarrier carrier;
StaticJsonDocument<200> doc;
char ssid[] = "VM1835225";        // ssid
char pass[] = "TH8s2sjpewmy";    // password for wifi
int status = WL_IDLE_STATUS;
const char* mqttServer = "broker.emqx.io";  // mqtt broker address
const int mqttPort = 1883;                  // standard mqtt port

WiFiClient wifiClient;
PubSubClient client(wifiClient);

// moisture sensor setup
const int moistureSensorPin = A6;


void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  setupWiFi();
  client.setServer(mqttServer, mqttPort);
  carrier.begin();
}

void loop() {
  
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  // read the sensor values
  float temperature = carrier.Env.readTemperature();
  float humidity    = carrier.Env.readHumidity();
  int moistureValue = analogRead(moistureSensorPin); // reads the moisture at pin A6

  // scaling moisture value 0-100 percentile 100 wet 0 dry
  float scaledMoisture = map(moistureValue, 0, 1023, 100, 0);

  char message[100];
  doc["deviceID"]="plantBuddy";
  doc["temp"]=temperature;
  doc["humidity"]=humidity;
  doc["moisture"]=scaledMoisture;
  doc["timestamp"]=millis();
  serializeJson(doc,message);
  // Your MQTT publish code goes here
  client.publish("/bakaichi/plantBuddy", message);
  delay(5000);  // Publish every 5 seconds
}

void setupWiFi() {
 // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  // attempt to connect to WiFi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);

    // wait 10 seconds for connection:
    delay(5000);
  }
  // you're connected now, so print out the data:
  Serial.println("You're connected to the network");
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ArduinoMKR1010")) {
      Serial.println("Connected to MQTT Broker!");
      Serial.print("Connection Result=");
      Serial.println(client.state());
    } else {
      Serial.print("failed, Connection Result=");
      Serial.println(client.state());
      delay(5000);
    }
  }
}