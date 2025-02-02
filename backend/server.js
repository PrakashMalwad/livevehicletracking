require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let latestGPSData = { lat: 0.0, lng: 0.0 };

//  API to receive GPS data from ESP32
app.post("/update_gps", (req, res) => {
    latestGPSData = req.body;
    console.log("Received GPS Data:", latestGPSData);
    res.status(200).send("GPS Data Updated");
});

//  API to provide the latest GPS data
app.get("/gps", (req, res) => {
    res.json(latestGPSData);
});

// Start Server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
