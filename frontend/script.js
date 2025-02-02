const apiURL = "https://192.168.1.108/gps";  // Change this to your backend URL

function fetchGPSData() {
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log("GPS Data:", data);
            document.getElementById("coords").innerText = `Latitude: ${data.lat}, Longitude: ${data.lng}`;
            updateMap(data.lat, data.lng);
        })
        .catch(error => console.error("Error fetching GPS data:", error));
}

setInterval(fetchGPSData, 5000);
