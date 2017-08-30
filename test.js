const fs = require('fs')
const path = require('path')
const test = require('tape')
const wmts = require('./src/wmts')

const arcgis = fs.readFileSync(path.join(__dirname, 'test', 'in', 'ArcGIS-online.xml'), 'utf8')
const mapbox = fs.readFileSync(path.join(__dirname, 'test', 'in', 'MapboxStudio.xml'), 'utf8')

test('wmts -- ArcGIS Online', t => {
  const metadata = wmts(arcgis)
  // Service
  t.equal(metadata.service.type, 'OGC WMTS')
  t.equal(metadata.service.version, '1.0.0')
  t.equal(metadata.service.title, 'World_Imagery')

  // Layer
  t.equal(metadata.layer.title, 'World_Imagery')
  t.equal(metadata.layer.identifier, 'World_Imagery')
  t.equal(metadata.layer.abstract, '')
  t.equal(metadata.layer.format, 'image/jpeg')
  t.equal(metadata.layer.minzoom, 0)
  t.equal(metadata.layer.maxzoom, 23)
  t.deepEqual(metadata.layer.bbox, [-179.99999000000003, -85.00000000000003, 179.99999000000003, 85.0])
  t.end()
})

test('wmts -- Mapbox Studio', t => {
  const metadata = wmts(mapbox)
  // Service
  t.equal(metadata.service.type, 'OGC WMTS')
  t.equal(metadata.service.version, '1.0.0')
  t.equal(metadata.service.title, 'Mapbox')

  // Layer
  t.equal(metadata.layer.title, 'Satellite Streets')
  t.equal(metadata.layer.identifier, 'ciy23jhla008n2soz34kg2p4u')
  t.equal(metadata.layer.abstract, '© OSM, © DigitalGlobe')
  t.equal(metadata.layer.format, 'image/jpeg')
  t.equal(metadata.layer.minzoom, 0)
  t.equal(metadata.layer.maxzoom, 20)
  t.deepEqual(metadata.layer.bbox, [-180, -85.051129, 179.976804, 85.051129])
  t.end()
})
