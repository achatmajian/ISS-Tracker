// Make map and tiles
const mymap = L.map("issMap", { minZoom: 1 }).setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

// mymap.setMaxBounds([[84.67351256610522, -174.0234375],[-58.995311187950925, 223.2421875]]);

// Create custom icon
const issIcon = L.icon({
    iconUrl: "iss200.png",
    iconSize: [50, 32],
    iconAnchor: [25, 16],
});

// Create a marker with a custom icon
const marker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);
const circle = L.circle([0, 0], { color: "#C02900", weight: 0, opacity: 1, fillColor: "#C02900", fillOpacity: .25 }).addTo(mymap);

// Create and update solar terminator
let terminator = L.terminator().addTo(mymap);
setInterval(function () {
    terminator.setTime();
}, 60000); // Every minute

// Initialization variables
let initializeView = true;
let centeredISS = true;
let initializeRadius = true;
let miles = true;

// Get and update data from API
async function getISS() {
    const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    const data = await response.json();
    const { latitude, longitude, velocity, altitude, timestamp, visibility, footprint, units } = data;

    // Initialize map view
    if (initializeView) {
        mymap.setView([latitude, longitude], 3);
        initializeView = false;
    }

    // Set marker and circle location
    marker.setLatLng([latitude, longitude]);
    circle.setLatLng([latitude, longitude]);

    // Miles Values
    let mVelocity = (velocity / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 2 });
    let mAltitude = (altitude / 1.609344).toFixed(2);
    let mFootprint = (footprint / 1.609344).toFixed(2);

    // Kilometers Values
    let kVelocity = velocity.toLocaleString('en-US', { maximumFractionDigits: 2 });
    let kAltitude = altitude.toFixed(2);
    let kFootprint = footprint.toFixed(2);

    // Time Value
    let formatTime = new Date(timestamp * 1000);
    let currentTime = formatTime.toLocaleTimeString(('en-US'));
    let currentDate = formatTime.toLocaleDateString(('en-US'));

    // Show Data Values
    function showData() {
        // Initial Lat & Long data values
        $("#lat").html(latitude);
        $("#long").html(longitude);

        if (miles === true) {
            // Initial miles data values
            $("#velocity").html(mVelocity);
            $("#velocity-unit").html("mph");

            $("#altitude").html(mAltitude);
            $("#altitude-unit").html("miles");

            $("#footprint").html(mFootprint);
            $("#footprint-unit").html("miles");

        } else if (miles === false) {
            // Initial kilometers data values
            $("#velocity").html(kVelocity);
            $("#velocity-unit").html("kmh");

            $("#altitude").html(kAltitude);
            $("#altitude-unit").html("kilometers");

            $("#footprint").html(kFootprint);
            $("#footprint-unit").html("kilometers");
        }

        // Time & Visitbility Data
        $("#timestamp").html(currentTime);
        $("#date").html(currentDate);
        $("#visibility").html(visibility);

        unitConvert = function (unitToggle) {
            if (unitToggle.checked === true) {
                console.log("Units are in imperial");
                miles = true;

                $("#velocity").html(mVelocity);
                $("#velocity-unit").html("mph");

                $("#altitude").html(mAltitude);
                $("#altitude-unit").html("miles");

                $("#footprint").html(mFootprint);
                $("#footprint-unit").html("miles");

            } else if (unitToggle.checked === false) {
                console.log("Units are in metric");
                miles = false;

                $("#velocity").html(kVelocity);
                $("#velocity-unit").html("kmh");

                $("#altitude").html(kAltitude);
                $("#altitude-unit").html("kilometers");

                $("#footprint").html(kFootprint);
                $("#footprint-unit").html("kilometers");
            }
        };
    }
    showData();

    // Reverse Geocode //////////////////////////////////////////////////////////
    const geoResponse = fetch(`https://pelias.github.io/compare/#/v1/reverse?layers=coarse&point.lat=${latitude}.lon=${longitude}`);
    const geoData = geoResponse;
    // const { properties, name } = geoData;
    // console.log(JSON.stringify(geoData));

    /* Initialise Reverse Geocode API Client */
    var reverseGeocoder = new BDCReverseGeocode();
    reverseGeocoder.localityLanguage = 'en';

    /* Get the administrative location information using a set of known coordinates */
    reverseGeocoder.getClientLocation({
        latitude: latitude,
        longitude: longitude,
    }, function (result) {
        // console.log(result);
        $("#locality").html(result.locality);

        $("#subdivision").html(result.principalSubdivision);
        if (Object.keys(result.principalSubdivision).length === 0) {
            $("#subdivision").html("Waiting...");
        }

        $("#country").html(result.countryName);
        if (Object.keys(result.countryName).length === 0) {
            $("#country").html("Waiting...");
        }

        $("#continent").html(result.continent);
        if (Object.keys(result.continent).length === 0) {
            $("#continent").html("Waiting...");
        }
    });
    // Reverse Geocode //////////////////////////////////////////////////////////

    // Toggle radius //////////////////////////////////////////////////////////
    function radius() {
        if (initializeRadius) {
            circle.setRadius(footprint * 1000);
            // Circle radius default is in meters, footprint value is in kilometers
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
    // Toggle radius //////////////////////////////////////////////////////////

    // Toggle icon centered on map //////////////////////////////////////////////////////////
    function getCenter() {
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
    }
    getCenter();
    // Toggle icon centered on map //////////////////////////////////////////////////////////

}


// Toggle live data updates
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