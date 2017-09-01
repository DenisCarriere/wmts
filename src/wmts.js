const xpath = require('xpath')
const DOMParser = require('xmldom').DOMParser
const utils = require('./utils')
const clean = utils.clean
const select = xpath.useNamespaces({
  'ows': 'http://www.opengis.net/ows/1.1',
  'xlink': 'http://www.w3.org/1999/xlink'
})

/**
 * WMTS Metadata
 *
 * @typedef {Object} Metadata
 * @property {Layer} layer
 * @property {Service} service
 * @property {URL} url
 */

/**
 * WMTS Metadata.Layer
 *
 * @typedef {Object} Layer
 * @property {string} title
 * @property {string} identifier
 * @property {string} format
 * @property {string} abstract
 * @property {string} resourceURL
 * @property {number} minzoom
 * @property {number} maxzoom
 * @property {[number, number, number, number]} bbox
 * @property {string[]} tileMatrixSets
 */

/**
 * WMTS Metadata.Service
 *
 * @typedef {Object} Service
 * @property {string} type
 * @property {string} version
 * @property {string} title
 */

 /**
 * WMTS Metadata.Layer.URL
 *
 * @typedef {Object} URL
 * @property {string} host
 * @property {string} slippy
 * @property {string} getCapabilities
 * @property {string} getTile
 */

function selectZooms (node) {
  const identifiers = select('//TileMatrixSet/TileMatrix/ows:Identifier', node)
  let minzoom
  let maxzoom
  for (const identifier of identifiers) {
    const zoom = Number(identifier.textContent)
    if (zoom < minzoom || minzoom === undefined) minzoom = zoom
    if (zoom > maxzoom || maxzoom === undefined) maxzoom = zoom
  }
  return {
    minzoom: minzoom,
    maxzoom: maxzoom
  }
}

function selectBBox (node) {
  var southwest = select('string(//ows:WGS84BoundingBox//ows:LowerCorner)', node, true)
  var northeast = select('string(//ows:WGS84BoundingBox//ows:UpperCorner)', node, true)
  if (southwest && northeast) {
    southwest = southwest.split(' ')
    northeast = northeast.split(' ')
    return [Number(southwest[0]), Number(southwest[1]), Number(northeast[0]), Number(northeast[1])]
  }
}

/**
 * Parse Layer
 *
 * @param {Document} doc
 * @returns {Layer} layer
 * @example
 * <Layer>
 *   <ows:Title>Satellite Streets</ows:Title>
 *   <ows:Identifier>ciy23jhla008n2soz34kg2p4u</ows:Identifier>
 *   <ows:Abstract>© OSM, © DigitalGlobe</ows:Abstract>
 *   <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
 *     <ows:LowerCorner>-180 -85.051129</ows:LowerCorner>
 *     <ows:UpperCorner>179.976804 85.051129</ows:UpperCorner>
 *   </ows:WGS84BoundingBox>
 *   <Style isDefault="true"><ows:Identifier>default</ows:Identifier></Style>
 *   <Format>image/jpeg</Format>
 *   <TileMatrixSetLink><TileMatrixSet>GoogleMapsCompatible</TileMatrixSet></TileMatrixSetLink>
 *   <ResourceURL format="image/jpeg" resourceType="tile" template="https://api.mapbox.com/styles/v1/addxy/ciy23jhla008n2soz34kg2p4u/tiles/{TileMatrix}/{TileCol}/{TileRow}?access_token=pk.eyJ1IjoiYWRkeHkiLCJhIjoiY2lsdmt5NjZwMDFsdXZka3NzaGVrZDZtdCJ9.ZUE-LebQgHaBduVwL68IoQ"/>
 * </Layer>
 */
function layer (doc) {
  const title = select('string(//Layer/ows:Title)', doc, true)
  const identifier = select('string(//Layer/ows:Identifier)', doc, true)
  const abstract = select('string(//Layer/ows:Abstract)', doc, true)
  const format = select('string(//Layer/Format)', doc, true)
  const tileMatrixSets = select('//Layer/TileMatrixSetLink/TileMatrixSet', doc).map(tileMatrixSet => tileMatrixSet.textContent)
  const bbox = selectBBox(doc)
  const zooms = selectZooms(doc)
  return {
    title: title,
    abstract: abstract,
    identifier: identifier,
    format: format,
    bbox: bbox,
    minzoom: zooms.minzoom,
    maxzoom: zooms.maxzoom,
    tileMatrixSets: tileMatrixSets
  }
}

/**
 * Parse URL
 *
 * @param {Document} doc
 * @returns {URL} url
 */
function url (doc) {
  const host = select("string(//*[name()='ows:ServiceType'])", doc)
  return {
    host: host
  }
}

/**
 * Parse Service
 *
 * @param {Document} doc
 * @returns {Service} service
 */
function service (doc) {
  const type = select("string(//*[name()='ows:ServiceType'])", doc)
  const version = select("string(//*[name()='ows:ServiceTypeVersion'])", doc)
  const title = select("string(//*[name()='ows:Title'])", doc)
  return {
    type: type,
    version: version,
    title: title
  }
}

/**
 * Parse Capabilities
 *
 * @param {string} xml
 * @returns {Metadata} WMTS Metadata
 */
module.exports = function (xml) {
  // Remove xmlns="http://www.opengis.net/wmts/1.0"
  xml = xml.replace(/xmlns="[\S]+"/, '')
  const doc = new DOMParser().parseFromString(xml)
  return clean({
    service: service(doc),
    layer: layer(doc),
    url: url(doc)
  })
}
