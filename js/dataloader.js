/*                                                                            Trajetos                                                                            */
$.getJSON('../Data/geojson/bikeways/CicloviaCascais.geojson', function(data) {  
    for (feature of data.features) {
        var coordinates = [];
        for ([lng, lat] of feature.geometry.coordinates[0]) {
            coordinates.push([lat, lng]);
        }
        
        var polyline = L.polyline(coordinates, {
            color: 'purple',
            weight: 4,
            opacity: 0.75,
            dashArray: '1, 2'
        });
        
        polylinesBikeways.addLayer(polyline);
    }
});

$.getJSON('../Data/geojson/bikeways/Ciclovias.geojson', function(data) {  
    for (feature of data.features) {
        var coordinates = [];
        if(feature.geometry != null) {
            for ([lng, lat] of feature.geometry.coordinates) {
                coordinates.push([lat, lng]);
            }
            
            var polyline = L.polyline(coordinates, {
                color: 'purple',
                weight: 4,
                opacity: 0.75,
                dashArray: '1, 2'
            });
            
            polylinesBikeways.addLayer(polyline);
        }
    }
});

$.getJSON('../Data/geojson/bikeways/CicloviasPorto.geojson', function(data) {  
    for (feature of data.features) {
        if (!feature.geometry || feature.geometry.type !== "LineString") {
            continue;
        }

        var coordinates = [];
        for ([lng, lat] of feature.geometry.coordinates) {
            coordinates.push([lat, lng]); // Leaflet uses [lat, lng] order
        }

        var polyline = L.polyline(coordinates, {
            color: 'purple',
            weight: 4,
            opacity: 0.75,
            dashArray: '1, 2'
        });

        polylinesBikeways.addLayer(polyline);
    }
});

$.getJSON('../Data/geojson/bikeways/CicloviasPortugal.geojson', function(data) {  
    for (feature of data.features) {
        if (!feature.geometry || feature.geometry.type !== "LineString") {
            continue;
        }

        var coordinates = [];
        for ([lng, lat] of feature.geometry.coordinates) {
            coordinates.push([lat, lng]); // Leaflet uses [lat, lng] order
        }

        var polyline = L.polyline(coordinates, {
            color: 'purple',
            weight: 4,
            opacity: 0.75,
            dashArray: '1, 2'
        });

        polylinesBikeways.addLayer(polyline);
    }
});

$.getJSON('../Data/geojson/trainways/RedeComboios.geojson', function(data) {  
    for (feature of data.features) {
        var coordinates = [];
        for ([lng, lat] of feature.geometry.coordinates) {
            coordinates.push([lat, lng]);
        }
        
        var polyline = L.polyline(coordinates, {
            color: 'cyan',
            weight: 4,
            opacity: 0.75,
            dashArray: '1, 2'
        });
        
        polylinesTrains.addLayer(polyline);
    }
});

$.getJSON('../Data/geojson/metrolines/LinesMetro.geojson', function(data) {  
    for (feature of data.features) {
        var coordinates = [];
        for ([lng, lat] of feature.geometry.coordinates) {
            coordinates.push([lat, lng]);
        }
        
        var polyline = L.polyline(coordinates, {
            color: feature.properties.colour,
            weight: 3.5,
            opacity: 1,
            dashArray: '1, 2'
        });
        
        polylinesMetro.addLayer(polyline);
    }
});

/*                                                                            MapPoints                                                                           */

$.getJSON('../Data/geojson/trainstations/EstacoesComboio.geojson', function(data) {  
    for (feature of data.features) {
        [lng, lat] = feature.geometry.coordinates;
        
        addMarkerWithTimedPopupTrain(feature);      
    }
});

$.getJSON('../Data/geojson/Aeroportos.geojson', function(data) {
        for (feature of data.features) {
            var coords = feature.geometry.coordinates[0];
            
            lat = coords[1];
            lng = coords[0];
            
            const markerInstance = L.marker([lat, lng], {icon: iconAirport})
            .bindPopup("<b><center> Aeroporto " + feature.properties.nome_longo + "</center></b>" +
                "<hr><h5>Coords: [" + lat + ", " + lng + "]</h5></hr>" +
                `<button onClick="changeCoordsDistance(1, ${lat}, ${lng})">Add as Starting Point.</button>` +
                `<button onClick="changeCoordsDistance(2, ${lat}, ${lng})">Add as Destination.</button>`);
                
            if (isMarkerInsideCircle(lat, lng, uCircle)) {
                currentRangeCluster.addLayer(markerInstance);
            } else {
                airportsCluster.addLayer(markerInstance);
            }
            
        }
    });

$.getJSON('../Data/geojson/Carris.json', function(data) {  
    for (let stop of data) {
        if (stop.operational_status == "ACTIVE") {
            addMarkerWithTimedPopupBus(stop);
        }   
    }
});