const xpath = require('xpath')
const DOMParser = require('xmldom').DOMParser
const utils = require('./utils')
const clean = utils.clean

/**
 * WMTS Metadata
 *
 * @typedef {Object} Metadata
 * @property {Layer} layer
 * @property {Service} service
 * @property {string} format
 * @property {string} abstract
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
 */

/**
 * WMTS Metadata.Service
 *
 * @typedef {Object} Service
 * @property {string} type
 * @property {string} version
 * @property {string} title
 */

function selectZooms (node) {
  const identifiers = xpath.select("//*[name()='TileMatrixSet']/*[name()='TileMatrix']/*[name()='ows:Identifier']", node)
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
  var southwest = xpath.select("string(//*[name()='ows:WGS84BoundingBox']//*[name()='ows:LowerCorner'])", node)
  var northeast = xpath.select("string(//*[name()='ows:WGS84BoundingBox']//*[name()='ows:UpperCorner'])", node)
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
 */
function layer (doc) {
  const title = xpath.select("string(//*[name()='Layer']//*[name()='ows:Title'])", doc)
  const identifier = xpath.select("string(//*[name()='Layer']//*[name()='ows:Identifier'])", doc)
  const abstract = xpath.select("string(//*[name()='Layer']//*[name()='ows:Abstract'])", doc)
  const format = xpath.select("string(//*[name()='Layer']//*[name()='Format'])", doc)
  const bbox = selectBBox(doc)
  const zooms = selectZooms(doc)
  return {
    title: title,
    abstract: abstract,
    identifier: identifier,
    format: format,
    bbox: bbox,
    minzoom: zooms.minzoom,
    maxzoom: zooms.maxzoom
  }
}

/**
 * Parse Service
 *
 * @param {Document} doc
 * @returns {Service} service
 */
function service (doc) {
  const type = xpath.select("string(//*[name()='Capabilities']//*[name()='ows:ServiceType'])", doc)
  const version = xpath.select("string(//*[name()='Capabilities']//*[name()='ows:ServiceTypeVersion'])", doc)
  const title = xpath.select("string(//*[name()='Capabilities']//*[name()='ows:Title'])", doc)
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
  const doc = new DOMParser().parseFromString(xml)
  return clean({
    service: service(doc),
    layer: layer(doc)
  })
}
