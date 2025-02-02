const apiURL = "https://livevehicletracking.onrender.com/gps";  // Change this to your backend URL

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

setInterval(fetchGPSData, 1000);
