var map = L.map('map').setView([38.661269, -9.203271], 28);

var markersData = [];

const airportsCluster = L.markerClusterGroup();
const trainCluster = L.markerClusterGroup();
const busesCluster = L.markerClusterGroup();
const userCluster = L.markerClusterGroup();
const polylinesBikeways = L.layerGroup(null);
const polylinesTrains = L.layerGroup(null);
const polylinesMetro = L.layerGroup(null);
const currentRangeCluster = L.markerClusterGroup();

var uCircle;

function isMarkerInsideCircle(markerLat, markerLng, circle) {
    var markerLatLng = L.latLng(markerLat, markerLng);
    var circleLatLng = circle.getLatLng();
    var distance = markerLatLng.distanceTo(circleLatLng);
    return distance <= circle.getRadius();
}

var markersTimes = {};

function startCountdown(marker, targetHour, targetMinute, lane, type) {
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(targetHour, targetMinute, 0, 0);

    if (!marker._leaflet_id) {
        marker.once('add', function () {
            startCountdown(marker, targetHour, targetMinute, lane, type);
        });
        return;
    }

    if (now > targetTime) {
        startCountdown(marker, targetHour + 1, targetMinute, lane, type);
        return;
    }

    function updateCountdown() {
        const currentTime = new Date();
        const timeDifference = targetTime - currentTime;

        if (timeDifference <= 0) {
            clearInterval(markersTimes[marker._leaflet_id].interval);
            return;
        }

        const remainingHours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const remainingMinutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const remainingSeconds = Math.floor((timeDifference / 1000) % 60);

        const times = markersTimes[marker._leaflet_id];
        if (lane === 1) {
            times.remainingHours1 = remainingHours;
            times.remainingMinutes1 = remainingMinutes;
            times.remainingSeconds1 = remainingSeconds;
        } else if (lane === 2) {
            times.remainingHours2 = remainingHours;
            times.remainingMinutes2 = remainingMinutes;
            times.remainingSeconds2 = remainingSeconds;
        }

        marker.setPopupContent(getMarkerPopupContent(marker, type));
    }

    markersTimes[marker._leaflet_id].interval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function getMarkerPopupContent(marker, type) {

    const times = markersTimes[marker._leaflet_id] || {};
    const {
        remainingHours1 = 0, remainingMinutes1 = 0, remainingSeconds1 = 0,
        remainingHours2 = 0, remainingMinutes2 = 0, remainingSeconds2 = 0
    } = times;

    const formatWaitTime = (hours, minutes, seconds) => {
        const hoursText = hours >= 1 ? `${hours} hours ` : '';
        return (hours || minutes || seconds)
            ? `${hoursText}${minutes} minutes ${seconds} seconds`
            : 'No time set';
    };

    const lane1Text = formatWaitTime(remainingHours1, remainingMinutes1, remainingSeconds1);
    const lane2Text = formatWaitTime(remainingHours2, remainingMinutes2, remainingSeconds2);

    const coords = marker.getLatLng();
    const coordsText = `[${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}]`;

    const popupContent = {
        train: `
            <b><center>Estação ${marker.options.name}</center></b>
            <hr><center><h4>Coords: ${coordsText}</h4></center></hr>
            <button onClick="changeCoordsDistance(1, ${coords.lat}, ${coords.lng})">Add as Starting Point.</button>
            <button onClick="changeCoordsDistance(2, ${coords.lat}, ${coords.lng})">Add as Destination.</button>
            <h3>Wait Time (Linha 1): ${lane1Text}</h3>
            <h3>Wait Time (Linha 2): ${lane2Text}</h3>
        `,
        bus: `
            <b><center>Estação de Autocarro de ${marker.options.name}</center></b>
            <hr><h5>Coords: ${coordsText}</h5></hr>
            <button onClick="changeCoordsDistance(1, ${coords.lat}, ${coords.lng})">Add as Starting Point.</button>
            <button onClick="changeCoordsDistance(2, ${coords.lat}, ${coords.lng})">Add as Destination.</button>
            <h3>Next bus in: ${lane1Text}</h3>
        `
    };

    return popupContent[type];
}

function addMarkerWithTimedPopup(data, type) {
    const lat = parseFloat(data.lat || data.geometry?.coordinates[1]);
    const lng = parseFloat(data.lon || data.geometry?.coordinates[0]);
    const name = data.name || data.properties?.NOME || "Unknown";

    const icon = type === "train" ? iconTrain : iconBus;
    const marker = L.marker([lat, lng], { icon, name, type });

    marker.once('add', () => {
        markersTimes[marker._leaflet_id] = markersTimes[marker._leaflet_id] || {
            remainingHours1: 0, remainingMinutes1: 0, remainingSeconds1: 0,
            remainingHours2: 0, remainingMinutes2: 0, remainingSeconds2: 0
        };
        getTransportTime(name, marker, type);
    });

    marker.bindPopup(() => getMarkerPopupContent(marker, type));
    marker.on('mouseover', () => marker.openPopup());

    const cluster = type === "train" ? trainCluster : busesCluster;
    if (isMarkerInsideCircle(lat, lng, uCircle)) {
        currentRangeCluster.addLayer(marker);
    } else {
        cluster.addLayer(marker);
    }
}

function addMarkerWithTimedPopupTrain(feature) {
    addMarkerWithTimedPopup(feature, "train");
}

function addMarkerWithTimedPopupBus(stop) {
    addMarkerWithTimedPopup(stop, "bus");
}


function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;

            map.setView([userLat, userLng], 15);

            L.marker([userLat, userLng], {icon: iconUserLocation})
                .addTo(map)
                .bindPopup("<b>This is your current location !</b>");

            uCircle = L.circle([userLat, userLng], {
                color: 'blue',
                fillColor: '#blue',
                fillOpacity: 0.37,
                radius: 10000
            });

            uCircle.addTo(map);
    
        }, function(error) {
            alert("Error getting your location: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

getUserLocation();

let lat1, lat2, lng1, lng2;

function changeCoordsDistance(buttonType, lat, lng) {
    if (buttonType == 1) {
        lat1 = lat;
        lng1 = lng;
    } else {
        lat2 = lat;
        lng2 = lng;
    }

    const event = new CustomEvent('coordsUpdated', {
        detail: { buttonType, lat, lng }
    });
    document.dispatchEvent(event);
}

loadCoords();

const defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com/en-us/arcgis/products/arcgis-online/overview">ESRI</a>'
});

defaultMap.addTo(map);

L.control.layers({
    "Mapa": defaultMap,
    "Satelite": satellite
}, {
    "Pins Within Range": currentRangeCluster,
    "Airports": airportsCluster,
    "Train Stations": trainCluster,
    "Bus Stops": busesCluster,
    "User Pins": userCluster,
    "Bikeways": polylinesBikeways,
    "TrainWays": polylinesTrains,
    "MetroLines": polylinesMetro
}).addTo(map);
