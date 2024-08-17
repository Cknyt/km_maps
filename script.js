import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import LineString from 'ol/geom/LineString';
import Draw from 'ol/interaction/Draw';
import { getLength } from 'ol/sphere';

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: [-3.749220, 40.463667], // España (longitud, latitud)
        zoom: 5
    })
});

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
    style: {
        'stroke-color': 'black',
        'stroke-width': 2
    }
});
map.addLayer(vector);

let sketch;
let distanciaTotal = 0;

const draw = new Draw({
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
    const distance = getLength(geometry); 
    distanciaTotal += distance / 1000; 
    document.getElementById('distancia').textContent = distanciaTotal.toFixed(2);
});