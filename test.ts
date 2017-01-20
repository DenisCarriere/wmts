import * as convert from 'xml-js'
import * as path from 'path'
import * as fs from 'fs'
import * as wmts from './'
import { Format, BBox } from './'

const title = 'Tile Service'
const identifier = 'tile-service-123'
const abstract = '© OSM data'
const minzoom = 10
const maxzoom = 18
const url = 'http://localhost:80/WMTS'
const keywords = ['world', 'imagery', 'wmts']
const format: Format = 'jpg'
const bbox: BBox = [-180, -85, 180, 85]
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
  format,
}

/**
 * Jest compare helper
 *
 * @param {ElementCompact} json
 * @param {string} fixture
 */
function compare(data: any, fixture: string) {
  fixture = path.join('fixtures', fixture)
  let xml = data
  if (typeof(data) !== 'string') { xml = convert.js2xml(data, {compact: true, spaces}) }
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
})
