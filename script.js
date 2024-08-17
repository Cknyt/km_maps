let map;
let draw; 
let source;
let vector;
let sketch;
let distanciaTotal = 0;

function initMap() {
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-3.749220, 40.463667]), // España (longitud, latitud)
            zoom: 5
        })
    });

    source = new ol.source.Vector(); 
    vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            })
        })
    });
    map.addLayer(vector);

    draw = new ol.interaction.Draw({
        source: source,
        type: 'LineString'
    });
    map.addInteraction(draw);

    draw.on('drawstart', function (event) {
        sketch = event.feature;
        distanciaTotal = 0;
    });

    draw.on('drawend', function (event) {
        const geometry = sketch.getGeometry();
        const distance = ol.sphere.getLength(geometry);
        distanciaTotal += distance / 1000;
        document.getElementById('distancia').textContent = distanciaTotal.toFixed(2);
    });
}

initMap();
