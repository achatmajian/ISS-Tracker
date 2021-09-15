// Making a map and tiles
const mymap = L.map('issMap', { minZoom: 1 }).setView([60, 0], 1);

// mymap.setMaxBounds(
//     [
//         [84.67351256610522, -174.0234375],
//         [-58.995311187950925, 223.2421875]
//     ]
// );

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

// var t = L.terminator({ time: Date.now() });
// t.addTo(mymap);
// setInterval(function () { updateTerminator(t) }, 1000);
// function updateTerminator(t) {
//     t.setTime();
// }

var terminator = L.terminator().addTo(mymap);
setInterval(function () {
    terminator.setTime();
}, 60000); // Every minute

// L.terminator({ time: Date.now() }).addTo(mymap)

const issIcon = L.icon({
    iconUrl: 'iss200.png',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
});

// Making a marker with a custom icon
const marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);
const circle = L.circle([0, 0]).addTo(mymap);


// Get and update data from API
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";

let initializeView = true;

async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    const { latitude, longitude, velocity, altitude, timestamp, visibility, footprint, units } = data;
    // console.log(footprint);

    // console.log(Date.now() / 1000);
    // console.log(timestamp);

    /* Initialise Reverse Geocode API Client */
    var reverseGeocoder = new BDCReverseGeocode();
    reverseGeocoder.localityLanguage = 'en';

    /* Get the administrative location information using a set of known coordinates */
    reverseGeocoder.getClientLocation({
        latitude: latitude,
        longitude: longitude,
    }, function (result) {
        console.log(result);
        document.getElementById("locality").textContent = result.locality;
        // document.getElementById("locality-info").textContent = result.localityInfo.informative[0].description;
        // document.getElementById("city").textContent = result.city;
        document.getElementById("subdivision").textContent = result.principalSubdivision;
        document.getElementById("country").textContent = result.countryName;
        document.getElementById("continent").textContent = result.continent;

        // console.log(result.localityInfo.informative[0].description);
        // console.log(result.localityInfo.informative[1].description);
    });

    /* You can also set the locality language as needed */
    // reverseGeocoder.localityLanguage = 'en';


    marker.setLatLng([latitude, longitude]);
    circle.setLatLng([latitude, longitude]);
    circle.setRadius(footprint * 1000);
    // Circle radius default is in meters, footprint



    // L.circleMarker([latitude, longitude], 1000).addTo(mymap);
    // console.log(getLatLng());

    // Center ISS icon on map
    mymap.setView(marker.getLatLng());
    mymap.panTo(marker.getLatLng());

    if (initializeView) {
        mymap.setView([latitude, longitude], 2);
        initializeView = false;
    }

    document.getElementById('lat').textContent = latitude;
    document.getElementById('long').textContent = longitude;
    document.getElementById('velocity').textContent = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
    document.getElementById('altitude').textContent = (altitude / 1.609344).toFixed(2);
    document.getElementById('footprint').textContent = (footprint / 1.609344).toFixed(2);

    document.getElementById('visibility').textContent = visibility;


    let formatTime = new Date(timestamp * 1000);
    document.getElementById('timestamp').textContent = formatTime.toLocaleTimeString(('en-US'));
    document.getElementById('date').textContent = formatTime.toLocaleDateString(('en-US'));

}
getISS();

// setInterval(getISS, 1000);

async function getAstronauts() {
    const peopleResponse = await fetch("http://api.open-notify.org/astros.json");
    const peopleData = await peopleResponse.json();
    const { people } = peopleData;
    for (let i = 0; i < people.length; i++) {
        if (people[i].craft === "ISS") {
            // console.log(people[i].name);
            let node = document.createElement("li");
            let textnode = document.createTextNode(people[i].name);
            node.appendChild(textnode);
            document.getElementById("astronauts").appendChild(node);
        }
    }
}
getAstronauts();
