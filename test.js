const fs = require('fs')
const path = require('path')
const test = require('tape')
const convert = require('xml-js')
const wmts = require('./')

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
  const fullpath = path.join(__dirname, 'test', fixture)
  var xml = data
  if (typeof (data) !== 'string') { xml = convert.js2xml(data, {compact: true, spaces}) }
  if (process.env.REGEN) fs.writeFileSync(fullpath, xml, 'utf-8')
  t.equal(xml, fs.readFileSync(fullpath, 'utf-8'), fixture)
}

test('wmts', t => {
  compare(t, wmts(options), 'WMTSCapabilities.xml')
  compare(t, wmts.GoogleMapsCompatible(minzoom, maxzoom), 'GoogleMapsCompatible.xml')
  compare(t, wmts.TileMatrix(minzoom, maxzoom), 'TileMatrix.xml')
  compare(t, wmts.ServiceIdentification(options), 'ServiceIdentification.xml')
  compare(t, wmts.Contents(options), 'Contents.xml')
  compare(t, wmts.OperationsMetadata(url), 'OperationsMetadata.xml')
  compare(t, wmts.Layer(options), 'Layer.xml')
  compare(t, wmts.Keywords(['foo', 'bar']), 'Keywords.xml')
  t.throws(() => wmts())
  t.throws(() => wmts({url}))
  t.throws(() => wmts({url, title}))
  t.end()
})

test('utils', t => {
  t.deepEqual(wmts.clean({foo: 10, bar: undefined}), {foo: 10})
  t.deepEqual(wmts.clean({foo: undefined, bar: undefined}), {})
  t.deepEqual(wmts.clean({foo: 0}), {foo: 0})
  t.end()
})
