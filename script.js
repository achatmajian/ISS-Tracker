// Making a map and tiles
const mymap = L.map('issMap').setView([0, 0], 1);
mymap.setMaxBounds([[84.67351256610522, -174.0234375], [-58.995311187950925, 223.2421875]]);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

const issIcon = L.icon({
    iconUrl: 'iss200.png',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
});

// Making a marker with a custom icon
const marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);

// Get and update data from API
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";

let firstTime = true;

async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    const { latitude, longitude, velocity, altitude, timestamp } = data;

    marker.setLatLng([latitude, longitude]);
    mymap.setView(marker.getLatLng());

    if (firstTime) {
        mymap.setView([latitude, longitude], 4);
        firstTime = false;
    }

    document.getElementById('lat').textContent = latitude;
    document.getElementById('long').textContent = longitude;
    document.getElementById('velocity').textContent = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
    document.getElementById('altitude').textContent = (altitude / 1.609344).toFixed(2);

    let formatTime = new Date(timestamp * 1000);
    document.getElementById('timestamp').textContent = formatTime.toLocaleTimeString(('en-US'));
    document.getElementById('date').textContent = formatTime.toLocaleDateString(('en-US'));
}
getISS();

setInterval(getISS, 1000);