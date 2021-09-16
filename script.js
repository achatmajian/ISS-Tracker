// Making a map and tiles
const mymap = L.map('issMap', { minZoom: 1 }).setView([0, 0], 1);

// mymap.setMaxBounds(
//     [[84.67351256610522, -174.0234375],
//     [-58.995311187950925, 223.2421875]]);

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

// Initialize variables
let initializeView = true;
let centeredISS = true;
let live = true;
let initializeRadius = true;
let miles = true;

// Making a marker with a custom icon
const marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);
let circle = L.circle([0, 0], { color: '#C02900', weight: 0, opacity: 1, fillColor: '#C02900', fillOpacity: .25 }).addTo(mymap);

// Get and update data from API
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";


async function getISS() {
    const response = await fetch(api_url);
    const data = await response.json();
    const { latitude, longitude, velocity, altitude, timestamp, visibility, footprint, units } = data;

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
        document.getElementById("subdivision").textContent = result.principalSubdivision;
        if (Object.keys(result.principalSubdivision).length === 0) {
            document.getElementById("subdivision").textContent = "Waiting..."
        }
        document.getElementById("country").textContent = result.countryName;
        if (Object.keys(result.countryName).length === 0) {
            document.getElementById("country").textContent = "Waiting..."
        }
        document.getElementById("continent").textContent = result.continent;
        if (Object.keys(result.continent).length === 0) {
            document.getElementById("continent").textContent = "Waiting..."
        }
    });

    // Set marker and circle location
    marker.setLatLng([latitude, longitude]);
    circle.setLatLng([latitude, longitude]);
    // circle.setRadius(footprint * 1000);

    function radius() {
        // Circle radius default is in meters, footprint value is in kilometers
        // circle.setRadius(footprint * 1000);

        if (initializeRadius) {
            circle.setRadius(footprint * 1000);
            initializeRadius = false;
        }

        radiusControl = function (radiusToggle) {
            if (radiusToggle.checked) {
                console.log("Radius is on");
                circle.setRadius(footprint * 1000);
            } else {
                console.log("Radius is off");
                circle.setRadius(footprint * 0)
            }
        };
    };
    radius();

    // Center ISS
    if (centeredISS) {
        mymap.setView(marker.getLatLng());
        mymap.panTo(marker.getLatLng());
    } else if (centeredISS === false) {
        mymap.setView(marker);
        mymap.panTo(marker);
    }

    centerIss = function (centerToggle) {
        if (centerToggle.checked) {
            console.log("ISS is centered");
            centeredISS = true;
        } else {
            console.log("ISS is not centered");
            centeredISS = false;
        }
    };

    // Initialize map view
    if (initializeView) {
        mymap.setView([latitude, longitude], 3);
        initializeView = false;
    }

    document.getElementById('lat').textContent = latitude;
    document.getElementById('long').textContent = longitude;

    document.getElementById('velocity').textContent = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
    document.getElementById("velocity-unit").textContent = "MPH";

    document.getElementById('altitude').textContent = (altitude / 1.609344).toFixed(2);
    document.getElementById("altitude-unit").textContent = "Miles";

    document.getElementById('footprint').textContent = (footprint / 1.609344).toFixed(2);
    document.getElementById("footprint-unit").textContent = "Miles";

    unitConvert = function (unitToggle) {
        if (unitToggle.checked) {
            console.log("Units are in imperial");
            miles = true;

            document.getElementById('velocity').textContent = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
            document.getElementById("velocity-unit").textContent = "mph";

            document.getElementById('altitude').textContent = (altitude / 1.609344).toFixed(2);
            document.getElementById("altitude-unit").textContent = "miles";

            document.getElementById('footprint').textContent = (footprint / 1.609344).toFixed(2);
            document.getElementById("footprint-unit").textContent = "miles";
        } else {
            console.log("Units are in metric");
            miles = false;

            document.getElementById('velocity').textContent = velocity.toLocaleString('en-US', { maximumFractionDigits: 3 });
            document.getElementById("velocity-unit").textContent = "km/h";

            document.getElementById('altitude').textContent = altitude.toFixed(2);
            document.getElementById("altitude-unit").textContent = "kilometers";


            document.getElementById('footprint').textContent = footprint.toFixed(2);
            document.getElementById("footprint-unit").textContent = "kilometers";
        }
    };

    document.getElementById('visibility').textContent = visibility;

    let formatTime = new Date(timestamp * 1000);
    document.getElementById('timestamp').textContent = formatTime.toLocaleTimeString(('en-US'));
    document.getElementById('date').textContent = formatTime.toLocaleDateString(('en-US'));

}

// getISS();

function getLiveData() {
    let initializeLive = true;
    let goLive = setInterval(getISS, 1000);

    if (initializeLive) {
        goLive;
        initializeLive = false;
    }

    liveUpdate = function (liveToggle) {
        if (liveToggle.checked) {
            console.log("Live update is on");
            initializeLive = true;
            goLive = setInterval(getISS, 1000);
        } else {
            console.log("Live update is off");
            initializeLive = false;
            clearInterval(goLive);
        }
    };
};
getLiveData();

async function getAstronautsTable() {
    const peopleResponse = await fetch("http://api.open-notify.org/astros.json");
    const peopleData = await peopleResponse.json();
    const { people } = peopleData;
    for (let i = 0; i < people.length; i++) {
        if (people[i].craft === "ISS") {

            // get the reference for the body
            var table1 = document.getElementById('table1Div');

            // get reference for <table> element
            var tbl = document.getElementById("table1");

            // creating rows
            for (var r = 0; r < people.length; r++) {
                var row = document.createElement("tr");

                // create cells in row
                for (var c = 0; c < 1; c++) {
                    var cell = document.createElement("td");
                    var cellText = document.createElement('span');
                    cellText.innerText = people[i].name;
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    console.log(people[i].name);
                }
            }

        }

        tbl.appendChild(row); // add the row to the end of the table body
    }

    table1.appendChild(tbl); // appends <table> into <div>
}
getAstronautsTable();