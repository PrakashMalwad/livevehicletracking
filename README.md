# Live Vehicle Tracking System

![Logo](https://img.icons8.com/ios/452/map-pin.png)  

## Overview
This project is a **Live Vehicle GPS Tracking System** that uses **ESP32** and **NEO-6M GPS Module** to track real-time location data and display it on a web-based map. The system involves multiple components: the ESP32 (embedded system), backend API for data handling, and a frontend web dashboard. All parts are integrated to provide a seamless experience for live vehicle tracking.

## Features
- **Real-Time GPS Tracking**: Display live location updates of vehicles.
- **Backend Integration**: ESP32 sends GPS data to a backend hosted on Render.
- **Frontend Dashboard**: Real-time location displayed on a map via Cloudflare Pages.
- **Responsive Design**: Works across devices for mobile and desktop views.
- **GPS Data Handling**: Seamless communication between ESP32 and the backend.

## Technologies Used

- **ESP32**: Low-power, Wi-Fi-enabled microcontroller.
- **NEO-6M GPS Module**: Provides accurate latitude and longitude data.
- **Backend**: REST API built with Express (Node.js), hosted on **Render**.
- **Frontend**: Interactive map using **Leaflet.js**, hosted on **Cloudflare Pages**.
- **API Requests**: ESP32 sends data to the backend using HTTP POST requests.

## How It Works

1. **ESP32 + NEO-6M GPS Module**:
   - The **ESP32** is connected to the **NEO-6M GPS module**.
   - The GPS module receives real-time location data and sends it to the **ESP32**.
   - The ESP32 sends the latitude and longitude to the backend at the endpoint:

     ```
     POST https://livevehicletracking.onrender.com/update_gps
     ```

2. **Backend**:
   - The **backend server** processes the incoming GPS data and stores it.
   - It serves the latest location data via a RESTful API for the frontend to access.

3. **Frontend**:
   - The frontend fetches the latest GPS coordinates from the backend.
   - The vehicle’s position is displayed on an interactive map using **Leaflet.js**.
   - The map is updated every few seconds to reflect real-time changes.

## Project Setup

### Hardware Requirements
- **ESP32 Development Board**: For Wi-Fi connectivity.
- **NEO-6M GPS Module**: For GPS data collection.

### Wiring the ESP32 and NEO-6M
- **NEO-6M GPS TX** → **ESP32 RX**.
- **NEO-6M GPS RX** → **ESP32 TX**.

### Software Requirements
1. **Arduino IDE or PlatformIO**: To upload code to the ESP32.
2. **Libraries**:
   - `TinyGPS++`: For parsing GPS data.
   - `WiFi.h`: To enable Wi-Fi functionality on ESP32.
   - `HTTPClient.h`: To make HTTP requests to the backend API.

### Backend (API) Setup
The backend is already deployed on **Render**. The API accepts incoming GPS data from ESP32:

- **API Endpoint**: 
  - `POST https://livevehicletracking.onrender.com/update_gps`

### Frontend Setup
The frontend is deployed and accessible via Cloudflare Pages:

- **Frontend Link**: [Live Vehicle Tracking Dashboard](https://livevehicletracking.pages.dev/)

The frontend fetches the data from the backend API and updates the map in real time.

## Code Snippet (ESP32)

Here’s a quick view of how the ESP32 code sends data to the backend:

```cpp
#include <TinyGPS++.h>
#include <WiFi.h>
#include <HardwareSerial.h>
#include <WebServer.h>
#include <HTTPClient.h>  // Include HTTPClient library

#define RXD2 16  // GPS TX → ESP32 RX2
#define TXD2 17  // GPS RX → ESP32 TX2

const char* ssid = "";      //WiFi SSID
const char* password = ""; //WiFi password
const String serverURL = "https://livevehicletracking.onrender.com/update_gps";  //server URL

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
WebServer server(80); // Web server on port 80

double latitude = 0.0, longitude = 0.0;

// HTML + JavaScript for OpenStreetMap
const char HTML_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>ESP32 GPS Tracker</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
</head>
<body>
    <h2>ESP32 GPS Tracker</h2>
    <p id="coords">Waiting for GPS data...</p>
    <div id="map" style="width: 100%; height: 400px;"></div>

    <script>
        var map = L.map('map').setView([0, 0], 2); // Default position
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        var marker = L.marker([0, 0]).addTo(map);

        function fetchGPSData() {
            fetch("/gps")
                .then(response => response.json())
                .then(data => {
                    if (data.lat !== null && data.lng !== null) {
                        document.getElementById("coords").innerText = `Latitude: ${data.lat}, Longitude: ${data.lng}`;
                        var newLatLng = new L.LatLng(data.lat, data.lng);
                        marker.setLatLng(newLatLng);
                        map.setView(newLatLng, 15);
                    } else {
                        document.getElementById("coords").innerText = "Waiting for valid GPS data...";
                    }
                })
                .catch(error => console.error("Error fetching GPS data:", error));
        }

        setInterval(fetchGPSData, 5000);
    </script>
</body>
</html>
)rawliteral";

void handleRoot() {
    server.send(200, "text/html", HTML_PAGE);
}

void handleGPSData() {
    // Always send last known coordinates, even if not updated recently
    String jsonData = "{\"lat\":" + String(latitude, 6) + ", \"lng\":" + String(longitude, 6) + "}";
    server.send(200, "application/json", jsonData);
}

void sendDataToServer(float lat, float lng) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverURL);  // Send data to server URL
        http.addHeader("Content-Type", "application/json");

        String jsonPayload = "{\"lat\": " + String(lat, 6) + ", \"lng\": " + String(lng, 6) + "}";
        int httpResponseCode = http.POST(jsonPayload);

        Serial.print("Server Response: ");
        Serial.println(httpResponseCode);

        http.end();
    } else {
        Serial.println("WiFi Disconnected! Cannot send data.");
    }
}

void setup() {
    Serial.begin(115200);
    gpsSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // Start web server
    server.on("/", handleRoot);
    server.on("/gps", handleGPSData);
    server.begin();
    Serial.println("Web server started.");
}

void loop() {
    while (gpsSerial.available()) {
        char c = gpsSerial.read();
        gps.encode(c);

        if (gps.location.isUpdated()) {
            latitude = gps.location.lat();
            longitude = gps.location.lng();
        }
    }

    // Print GPS data every 2 seconds
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint > 2000) {
        Serial.print("Latitude: ");
        Serial.print(latitude, 6);
        Serial.print(" | Longitude: ");
        Serial.println(longitude, 6);
        sendDataToServer(latitude, longitude);  // Send data to server
        lastPrint = millis();
    }

    // Handle web client requests
    server.handleClient();
}

