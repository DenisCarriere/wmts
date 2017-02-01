const convert = require('xml-js')
const path = require('path')
const fs = require('fs')
const wmts = require('.')

// Variables
const title = 'Tile Service'
const identifier = 'tile-service-123'
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
  identifier,
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
function compare (data, fixture) {
  fixture = path.join('fixtures', fixture)
  let xml = data
  if (typeof (data) !== 'string') { xml = convert.js2xml(data, {compact: true, spaces}) }
  if (process.env.REGEN) { fs.writeFileSync(fixture, xml, 'utf-8') }
  expect(xml).toBe(fs.readFileSync(fixture, 'utf-8'))
}

describe('Capabilities', () => {
  test('GoogleMapsCompatible', () => compare(wmts.GoogleMapsCompatible(minzoom, maxzoom), 'GoogleMapsCompatible.xml'))
  test('TileMatrix', () => compare(wmts.TileMatrix(minzoom, maxzoom), 'TileMatrix.xml'))
  test('ServiceIdentification', () => compare(wmts.ServiceIdentification({title, keywords}), 'ServiceIdentification.xml'))
  test('Keywords', () => compare(wmts.Keywords(keywords), 'Keywords.xml'))
  test('OperationsMetadata', () => compare(wmts.OperationsMetadata(url), 'OperationsMetadata.xml'))
  test('Layer', () => compare(wmts.Layer(options), 'Layer.xml'))
  test('getCapabilities', () => compare(wmts.getCapabilities(options), 'WMTSCapabilities.xml'))
  test('throw error', () => expect(() => wmts.getCapabilities('invalid')).toThrow())
})

describe('utils', () => {
  test('clean({foo: 10, bar: undefined})', () => expect(wmts.clean({foo: 10, bar: undefined})).toEqual({foo: 10}))
  test('clean({foo: undefined, bar: undefined})', () => expect(wmts.clean({foo: undefined, bar: undefined})).toEqual({}))
  test('clean({foo: 0})', () => expect(wmts.clean({foo: 0})).toEqual({foo: 0}))
})
