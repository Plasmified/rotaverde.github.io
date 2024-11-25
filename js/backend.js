function loadCoords() {
    fetch('https://rotaverde.sytes.net:5000/api/', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    }
).then((response) => {
    if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
    }
    return response.text();
}).then((data) => {
    markersData = JSON.parse(data);
    markersData.forEach(marker => {
        var icon;
        
        switch (marker.pinType) {
            case "Bus":
            icon = iconBus;
            break;
            case "Train":
            icon = iconTrain;
            break;
            case "Airport":
            icon = iconAirport;
            break;
            case "User":
            icon = iconPoint;
            break;
        }
        
        const { latitude, longitude } = marker.pinLoc;
        const markerInstance = L.marker([latitude, longitude], {icon: icon})
        .bindPopup("<div class='custom-popup'>" +
            "<b><center>" + marker.pinName + "</center></b>" +
            "<hr><center><h5>Coords: [" + latitude + ", " + longitude + "]</h5></center></hr>" +
            `<center><button onClick="changeCoordsDistance(1, ${latitude}, ${longitude})">Add as Starting Point.</button></center>` +
            `<center><button onClick="changeCoordsDistance(2, ${latitude}, ${longitude})">Add as Destination.</button></center>` + "</div>");
        
            markerInstance.on('mouseover', () => markerInstance.openPopup());
            
            if (isMarkerInsideCircle(latitude, longitude, uCircle)) {
                currentRangeCluster.addLayer(markerInstance);
            }
            
            switch (icon) {
                case iconBus:
                busesCluster.addLayer(markerInstance);
                break;
                case iconTrain:
                trainCluster.addLayer(markerInstance);
                break;
                case iconAirport:
                airportsCluster.addLayer(markerInstance);
                case iconPoint:
                userCluster.addLayer(markerInstance);
                break;
            }
        });
    }).catch((error) => {
        console.error('Error:', error);
    });
}

const addPin = async (pinId, latitude, longitude, pinName) => {
    const url = `https://rotaverde.sytes.net:5000/api/pin/${pinId}`;

    var pinLoc =
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        };

    const data = {
        pinLoc: pinLoc,
        pinName: pinName,
        pinType: "User"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.text();
            console.log('Success:', result);
            alert('Pin created successfully!');
            location.reload();
        } else {
            const error = await response.text();
            console.error('Error:', error);
            alert('Failed to create pin: ' + error);
        }
    } catch (err) {
        console.error('Network Error:', err.message);
        alert('An error occurred while creating the pin.');
    }
};

const getTransportTime = async(name, marker, type) => {
    const url = `https://rotaverde.sytes.net:5000/api/transports/${name}`; 

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.arrivalLine1 && result.arrivalLine2 && type == "train") {
                startCountdown(marker, parseInt(result.arrivalLine1), 0, 1, type);
                startCountdown(marker, parseInt(result.arrivalLine2), 0, 2, type);
            } else if (result.arrivalTime && type == "bus") {
                startCountdown(marker, parseInt(result.arrivalTime), 0, 1, type);
            } else {
                console.error('Arrival lines not found in response');
                return null;
            }
        }
    } catch (err) {
        console.error('Network Error:', err.message);
        alert('An error occurred while creating the pin.');
    }
}
