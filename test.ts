import * as convert from 'xml-js'
import * as path from 'path'
import * as fs from 'fs'
import * as wmts from './'

const title = 'Tile Service'
const minzoom = 10
const maxzoom = 18
const uri = 'http://localhost:80/WMTS'
const keywords = ['world', 'imagery', 'wmts']

/**
 * Jest compare helper
 *
 * @param {ElementCompact} json
 * @param {string} fixture
 */
function compare(json: any, fixture: string) {
  const xml = convert.js2xml(json, {compact: true, spaces: 2})
  if (process.env.REGEN) { fs.writeFileSync(fixture, xml, 'utf-8') }
  expect(xml).toBe(fs.readFileSync(fixture, 'utf-8'))
}

describe('Capabilities', () => {
  test('GoogleMapsCompatible', () => compare(wmts.GoogleMapsCompatible(minzoom, maxzoom), path.join('fixtures', 'GoogleMapsCompatible.xml')))
  test('TileMatrix', () => compare(wmts.TileMatrix(minzoom, maxzoom), path.join('fixtures', 'TileMatrix.xml')))
  test('ServiceIdentification', () => compare(wmts.ServiceIdentification({title, keywords}), path.join('fixtures', 'ServiceIdentification.xml')))
  test('Keywords', () => compare(wmts.Keywords(keywords), path.join('fixtures', 'Keywords.xml')))
  test('OperationsMetadata', () => compare(wmts.OperationsMetadata(uri), path.join('fixtures', 'OperationsMetadata.xml')))
})
