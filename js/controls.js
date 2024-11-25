var originLocation = [38.661269, -9.203271];
var originButton = L.control({ position: 'topright' });

originButton.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-control-custom');
    
    button.innerHTML = `<img 
            src="https://cdn-icons-png.flaticon.com/512/553/553376.png" 
            alt="Recenter" 
            style="width: 22px; height: 22px; vertical-align: middle; filter: invert(1);"
        />`;

    button.onclick = function () {
        map.setView(originLocation, 28);
    };

    return button;
};

var changeOriginButton = L.control({ position: 'topright' });

changeOriginButton.onAdd = function (map) {
    var container = L.DomUtil.create('div', 'leaflet-control-custom-container');

    var button = L.DomUtil.create('button', 'leaflet-control-custom', container);
    button.innerHTML = `
        <img 
            src="https://cdn-icons-png.flaticon.com/512/6348/6348021.png" 
            alt="Origin" 
            style="width: 22px; height: 22px; vertical-align: middle; filter: invert(1);"
        />
    `;

    var formContainer = L.DomUtil.create('div', 'distance-form hidden', container);

    formContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 10px;">
            <input type="text" id="originpoint1-lat" placeholder="Point 1 Latitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
            <input type="text" id="originpoint1-lng" placeholder="Point 1 Longitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
        </div>
        <button id="change-origin" style="margin-top: 22px; background-color: rgba(55, 95, 55, 0.667); border: none;">Change Origin</button>
    `;

    container.appendChild(formContainer);

    button.onclick = function () {
        formContainer.classList.toggle('hidden');
        
        if (formContainer.classList.contains('hidden')) {
            button.classList.remove('show-form');
        } else {
            button.classList.add('show-form');
        }
    };

    formContainer.querySelector('#change-origin').onclick = function () {
        var originlat1 = parseFloat(document.getElementById('originpoint1-lat').value);
        var originlng1 = parseFloat(document.getElementById('originpoint1-lng').value);
        if (!isNaN(originlat1) && !isNaN(originlng1)) {
            originLocation = [originlat1, originlng1];
            alert(`The origin has been redefined to ${originlat1, originlng1}.`);
        } else {
            alert('Please enter valid coordinates.');
        }
    };

    return container;
};

var distanceButton = L.control({ position: 'topright' });

distanceButton.onAdd = function (map) {
    var container = L.DomUtil.create('div', 'leaflet-control-custom-container');

    var button = L.DomUtil.create('button', 'leaflet-control-custom', container);
    button.innerHTML = `
        <img 
            src="https://cdn-icons-png.flaticon.com/512/503/503054.png" 
            alt="Distance" 
            style="width: 22px; height: 22px; vertical-align: middle; filter: invert(1);"
        />
    `;

    var formContainer = L.DomUtil.create('div', 'distance-form hidden', container);

    formContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 10px;">
            <input type="text" id="point1-lat" placeholder="Point 1 Latitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
            <input type="text" id="point1-lng" placeholder="Point 1 Longitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
        </div>
        <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 10px;">
            <input type="text" id="point2-lat" placeholder="Point 2 Latitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
            <input type="text" id="point2-lng" placeholder="Point 2 Longitude" style="flex: 1; background-color: rgba(100, 95, 100, 0.75); border: none;" />
        </div>
        <button id="calculate-distance" style="margin-top: 22px; background-color: rgba(55, 95, 55, 0.667); border: none;">Calculate Distance</button>
    `;

    container.appendChild(formContainer);

    button.onclick = function () {
        formContainer.classList.toggle('hidden');
        
        if (formContainer.classList.contains('hidden')) {
            button.classList.remove('show-form');
        } else {
            button.classList.add('show-form');
        }
    };

    formContainer.querySelector('#calculate-distance').onclick = function () {
        if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
            lat1 = parseFloat(document.getElementById('point1-lat').value);
            lng1 = parseFloat(document.getElementById('point1-lng').value);
            lat2 = parseFloat(document.getElementById('point2-lat').value);
            lng2 = parseFloat(document.getElementById('point2-lng').value);
            var distance =  turf.distance(turf.point([lat1, lng1]), turf.point([lat2, lng2]), { units: 'kilometers' });
            alert(`The distance between the points is ${distance.toFixed(2)} kilometers.`);
        } else {
            alert('Please enter valid coordinates for both points.');
        }
    };

    return container;
};

document.addEventListener('coordsUpdated', (event) => {
    const { buttonType, lat, lng } = event.detail;

    if (buttonType == 1) {
        document.getElementById('point1-lat').value = lat;
        document.getElementById('point1-lng').value = lng;
    } else {
        document.getElementById('point2-lat').value = lat;
        document.getElementById('point2-lng').value = lng;
    }
});

originButton.addTo(map);
changeOriginButton.addTo(map);
distanceButton.addTo(map);

map.on('click', function (e) {
    var latitude = e.latlng.lat;
    var longitude = e.latlng.lng;

    var pinId = Math.round(Math.random() * 10000);
    var pinName = `Pin No : ${pinId}`;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(`<div style="">Latitude: ${latitude.toFixed(6)}<br>Longitude: ${longitude.toFixed(6)}</body>`
                    + `<center><button onClick="addPin('${pinId}', '${latitude}', '${longitude}', '${pinName}')" style="margin-top: 22px; background-color: rgba(55, 95, 55, 0.667); border: none;">Add to map</button></center>`)
        .openOn(map);
});