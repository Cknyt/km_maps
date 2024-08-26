// Reinicia los valores cuando se carga la página
window.onload = function() {
    // Reinicia la distancia total a 0
    kilometros = 0;
    document.getElementById('distanceValue').innerHTML = 'Distancia total: 0 km';
  
    // Limpia el geojson
    geojson.features = [];
  
    // Limpia el mapa
    map.getSource('geojson').setData(geojson);
  };

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets/style.json?key=idiyqB3zz6EZxIrEjWbz',
    center: [-2.9166, 43.4161], // Coordenadas de Bilbao
    zoom: 12,
    pitch: 60, // Inclinación inicial
    bearing: -17.6 // Rotación inicial
});

const distanceValue = document.getElementById('distanceValue');
const stopButton = document.getElementById('stopButton');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const tiltUpButton = document.getElementById('tiltUp');
const tiltDownButton = document.getElementById('tiltDown');
const rotateLeftButton = document.getElementById('rotateLeft');
const rotateRightButton = document.getElementById('rotateRight');
const distanceContainer = document.getElementById('distance');

const points = [];
let currentFetch = null; // Para almacenar la solicitud fetch actual
let isCalculating = true; // Asegúrate de que esta variable esté disponible

document.getElementById('stopButton').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas finalizar el cálculo?')) {
      window.location.href = 'cast.html';
    }
  });

map.on('load', () => {
    // Agregar edificios en 3D
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    });

    map.on('click', (e) => {
        if (!isCalculating) return;

        const lngLat = e.lngLat;
        points.push([lngLat.lng, lngLat.lat]);

        if (points.length > 1) {
            const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${points.join(';')}?geometries=geojson&access_token=pk.eyJ1IjoiY2tueXQiLCJhIjoiY20wNDJ2NHUwMDJodDJxc2g4ZjNxbTh0NCJ9.zKJdloRXLKoWKa-1mq9iwA`;

            currentFetch = fetch(url) // Almacenar la solicitud fetch
                .then(response => response.json())
                .then(data => {
                    const route = data.routes[0];
                    const distance = (route.distance / 1000).toFixed(2);

                    const geojson = {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': route.geometry,
                                'properties': {}
                            }
                        ]
                    };

                    if (map.getSource('route')) {
                        map.getSource('route').setData(geojson);
                    } else {
                        map.addSource('route', {
                            'type': 'geojson',
                            'data': geojson
                        });
                        map.addLayer({
                            'id': 'route',
                            'type': 'line',
                            'source': 'route',
                            'layout': {
                                'line-cap': 'round',
                                'line-join': 'round'
                            },
                            'paint': {
                                'line-color': '#3887be',
                                'line-width': 5,
                                'line-opacity': 0.75
                            }
                        });
                    }

                    distanceValue.textContent = `Distancia total: ${distance} km`;

                    // Guardar la distancia en el almacenamiento local
                    localStorage.setItem('distanciaTotal', distance);
                    currentFetch = null; // Reiniciar la variable después de completar la solicitud
                })
                .catch(error => {
                    console.error('Error al obtener la ruta:', error);
                    currentFetch = null;
                });
        }
    });

    map.on('mousemove', () => {
        map.getCanvas().style.cursor = 'crosshair';
    });

    // Manejar las acciones de los botones
    zoomInButton.addEventListener('click', () => {
        map.zoomIn();
    });

    zoomOutButton.addEventListener('click', () => {
        map.zoomOut();
    });

    tiltUpButton.addEventListener('click', () => {
        map.setPitch(map.getPitch() + 10); // Aumenta la inclinación en 10 grados
    });

    tiltDownButton.addEventListener('click', () => {
        map.setPitch(map.getPitch() - 10); // Disminuye la inclinación en 10 grados
    });

    rotateLeftButton.addEventListener('click', () => {
        map.setBearing(map.getBearing() - 10); // Rota el mapa a la izquierda en 10 grados
    });

    rotateRightButton.addEventListener('click', () => {
        map.setBearing(map.getBearing() + 10); // Rota el mapa a la derecha en 10 grados
    });

    stopButton.addEventListener('click', () => {
        if (currentFetch) {
            currentFetch.abort(); // Cancelar la solicitud fetch si está en curso
            currentFetch = null;
            points.length = 0; // Limpiar los puntos
            if (map.getSource('route')) {
                map.getSource('route').setData({
                    'type': 'FeatureCollection',
                    'features': []
                });
            }
            distanceValue.textContent = `Distancia total: 0 km`;
            isCalculating = false; // Finalizar el cálculo
            stopButton.textContent = 'Cálculo finalizado';
            stopButton.disabled = true;

           // Redirigir a cast.html después de finalizar el cálculo
        setTimeout(() => {
            window.location.href = 'cast.html';
        }, 100); // Añadir un pequeño retraso para asegurar que la lógica se complete
        }
    });
});
