import "./styles.css";

let masterCount = 0;

const mapFetch = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();
  initMap(data);
};

const initMap = (data) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJson = L.geoJSON(data, {
    onEachFeature: getFeature,
    style: getStyle
  }).addTo(map);

  let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  let overlayMaps = {
    Kunnat: geoJson
  };

  let baseMaps = {
    OpenStreeMap: osm
  };

  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getFeature = (feature, layer) => {
  if (!feature.properties.name) {
    return;
  }
  layer.bindTooltip(feature.properties.name);
  layer.bindPopup(`
    ${posMuutto[masterCount]}
    ${negMuutto[masterCount]}
  `);
  masterCount += 1;
};

const getStyle = (feature) => {
  return {
    color: `hsl(${variLista[masterCount - 1]} 75% 50%)`,
    fillOpacity: 0.5
  };
};

async function createLists() {
  const urlPos =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const urlNeg =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";

  const resPos = await fetch(urlPos);
  const resNeg = await fetch(urlNeg);
  const dataPos = await resPos.json();
  const dataNeg = await resNeg.json();

  const posLista = dataPos.dataset.value;
  const negLista = dataNeg.dataset.value;

  for (let i = 1; i <= posLista.length; i++) {
    posMuutto.push(posLista[i]);
    negMuutto.push(negLista[i]);
    netMuutto.push(posLista[i] - negLista[i]);

    let variKoodi =
      (negLista[i] / posLista[i]) *
      (negLista[i] / posLista[i]) *
      (negLista[i] / posLista[i]) *
      60;

    if (variKoodi >= 120) {
      variKoodi = 120;
    }

    variLista.push(variKoodi);
  }

  mapFetch();
}

const posMuutto = [];
const negMuutto = [];
const netMuutto = [];
const variLista = [];

createLists();
