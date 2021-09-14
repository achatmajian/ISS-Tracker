// Making a map and tiles
const mymap = L.map('issMap', { minZoom: 1 }).setView([0, 0], 1);
mymap.setMaxBounds([[84.67351256610522, -174.0234375], [-58.995311187950925, 223.2421875]]);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

// var t = L.terminator({ time: "2013-06-20T21:00:00Z" });
// t.addTo(mymap);
// setInterval(function () { updateTerminator(t) }, 1000);
// function updateTerminator(t) {
//     t.setTime();
// }

var t = L.terminator({ time: Date.now() });
t.addTo(mymap);
setInterval(function () { updateTerminator(t) }, 1000);
function updateTerminator(t) {
    t.setTime();
}

// L.terminator({ time: Date.now() }).addTo(mymap)


const issIcon = L.icon({
    iconUrl: 'iss200.png',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
});

// Making a marker with a custom icon
const marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);

// Get and update data from API
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";

let initializeView = true;

async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    const { latitude, longitude, velocity, altitude, timestamp, visibility } = data;


    const peopleResponse = await fetch("http://api.open-notify.org/astros.json");
    const peopleData = await peopleResponse.json();
    const { people, name, craft } = peopleData;
    console.log(people[0].name);
    console.log(people[0].craft);
    console.log(name);
    console.log(craft);
    // if (people.craft === "ISS") {
    //     console.log(people);
    // }



    /* Initialise Reverse Geocode API Client */
    var reverseGeocoder = new BDCReverseGeocode();

    // /* Get the current user's location information, based on the coordinates provided by their browser */
    // /* Fetching coordinates requires the user to be accessing your page over HTTPS and to allow the location prompt. */
    // reverseGeocoder.getClientLocation(function (result) {
    //     console.log(result);
    // });

    /* Get the administrative location information using a set of known coordinates */
    reverseGeocoder.getClientLocation({
        latitude: latitude,
        longitude: longitude,
    }, function (result) {
        console.log(result);
        document.getElementById("locality").textContent = result.locality;
        // document.getElementById("locality-info").textContent = result.localityInfo.informative[0].description;
        // document.getElementById("city").textContent = result.city;
        // document.getElementById("subdivision").textContent = result.principalSubdivision;
        document.getElementById("country").textContent = result.countryName;
        document.getElementById("continent").textContent = result.continent;

        console.log(result.localityInfo.informative[0].description);
        // console.log(result.localityInfo.informative[1].description);
    });

    /* You can also set the locality language as needed */
    reverseGeocoder.localityLanguage = 'en';

    // /* Request the current user's coordinates (requires HTTPS and acceptance of prompt) */
    // reverseGeocoder.getClientCoordinates(function (result) {
    //     console.log(result);
    // });




    marker.setLatLng([latitude, longitude]);

    // Center ISS icon on map
    mymap.setView(marker.getLatLng());

    if (initializeView) {
        mymap.setView([latitude, longitude], 4);
        initializeView = false;
    }

    document.getElementById('lat').textContent = latitude;
    document.getElementById('long').textContent = longitude;
    document.getElementById('velocity').textContent = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
    document.getElementById('altitude').textContent = (altitude / 1.609344).toFixed(2);
    document.getElementById('visibility').textContent = visibility;


    let formatTime = new Date(timestamp * 1000);
    document.getElementById('timestamp').textContent = formatTime.toLocaleTimeString(('en-US'));
    document.getElementById('date').textContent = formatTime.toLocaleDateString(('en-US'));

}
getISS();

// setInterval(getISS, 1000);