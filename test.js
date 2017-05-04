const fs = require('fs')
const path = require('path')
const test = require('tape')
const convert = require('xml-js')
const utils = require('./src/utils')
const getCapabilities = require('./src/getCapabilities')
const parseCapabilities = require('./src/parseCapabilities')

// Variables
const title = 'Tile Service'
const abstract = '© OSM data'
const minzoom = 10
const maxzoom = 18
const url = 'http://localhost:80/WMTS'
const keywords = ['world', 'imagery', 'wmts']
const format = 'jpg'
const bbox = [-180, -85, 180, 85]
const spaces = 2
const options = {
  title,
  spaces,
  abstract,
  minzoom,
  maxzoom,
  bbox,
  url,
  keywords,
  format
}

/**
 * Jest compare helper
 *
 * @param {ElementCompact} json
 * @param {string} fixture
 */
function compare (t, data, fixture) {
  var fullpath = path.join(__dirname, 'test', fixture)
  let xml = data
  if (typeof (data) !== 'string') { xml = convert.js2xml(data, {compact: true, spaces}) }
  if (process.env.REGEN) { fs.writeFileSync(fullpath, xml, 'utf-8') }
  t.equal(xml, fs.readFileSync(fullpath, 'utf-8'), fixture)
}

test('wmts.parseCapabilities - ArcGIS Online', t => {
  const xml = fs.readFileSync(path.join(__dirname, 'test', 'samples', 'ArcGIS-online.xml'), 'utf8')
  const results = parseCapabilities(xml)
  t.equal(results.title, 'World_Imagery', 'title')
  t.equal(results.identifier, 'World_Imagery', 'identifier')
  t.equal(results.url, 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/tile/1.0.0/World_Imagery/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg', 'url')
  t.equal(results.format, 'jpeg', 'format')
  t.end()
})

test('wmts.getCapabilities', t => {
  compare(t, getCapabilities.getCapabilities(options), 'WMTSCapabilities.xml')
  compare(t, getCapabilities.GoogleMapsCompatible(minzoom, maxzoom), 'GoogleMapsCompatible.xml')
  compare(t, getCapabilities.TileMatrix(minzoom, maxzoom), 'TileMatrix.xml')
  compare(t, getCapabilities.ServiceIdentification(options), 'ServiceIdentification.xml')
  compare(t, getCapabilities.Contents(options), 'Contents.xml')
  compare(t, getCapabilities.OperationsMetadata(url), 'OperationsMetadata.xml')
  compare(t, getCapabilities.Layer(options), 'Layer.xml')
  compare(t, getCapabilities.Keywords(['foo', 'bar']), 'Keywords.xml')
  t.throws(() => getCapabilities.getCapabilities())
  t.throws(() => getCapabilities.getCapabilities({url}))
  t.throws(() => getCapabilities.getCapabilities({url, title}))
  t.end()
})

test('wmts.utils', t => {
  t.deepEqual(utils.clean({foo: 10, bar: undefined}), {foo: 10})
  t.deepEqual(utils.clean({foo: undefined, bar: undefined}), {})
  t.deepEqual(utils.clean({foo: 0}), {foo: 0})
  t.deepEqual(utils.range(0, 3), [0, 1, 2])
  t.deepEqual(utils.range(3), [0, 1, 2])
  t.deepEqual(utils.range(3, 0), [3, 2, 1])
  t.deepEqual(utils.range(0, 5, 2), [0, 2, 4])
  t.end()
})
