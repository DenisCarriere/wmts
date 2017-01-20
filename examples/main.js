const wmts = require('../')

console.log(`
wmts.getCapabilities({
  url: 'http://localhost:5000/WMTS',
  title: 'Tile Service XYZ',
  identifier: 'service-123',
  abstract: '© OSM data',
  keyword: ['world', 'imagery', 'wmts'],
  format: 'png',
  minzoom: 10,
  maxzoom: 18,
  bbox: [-180, -85, 180, 85]
})
`)
const xml = wmts.getCapabilities({
  url: 'http://localhost:5000/WMTS',
  title: 'Tile Service XYZ',
  identifier: 'service-123',
  abstract: '© OSM data',
  keyword: ['world', 'imagery', 'wmts'],
  format: 'png',
  minzoom: 10,
  maxzoom: 18,
  bbox: [-180, -85, 180, 85]
})
console.log(xml)