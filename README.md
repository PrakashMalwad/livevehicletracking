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
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>

TinyGPSPlus gps;
WiFiClient client;

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverName = "https://livevehicletracking.onrender.com/update_gps";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("Connected to WiFi");
}

void loop() {
  // Simulate GPS data reading
  float latitude = gps.location.lat();
  float longitude = gps.location.lng();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = String("{\"latitude\":") + latitude + ",\"longitude\":" + longitude + "}";

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }

    http.end();
  }

  delay(10000);  // Send data every 10 seconds
}
