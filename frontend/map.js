var map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var marker = L.marker([0, 0]).addTo(map);

function updateMap(lat, lng) {
    var newLatLng = new L.LatLng(lat, lng);
    marker.setLatLng(newLatLng);
    map.setView(newLatLng, 15);
}
    