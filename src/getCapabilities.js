const convert = require('xml-js')
const utils = require('./utils')
const mercator = require('global-mercator')
const range = utils.range
const normalize = utils.normalize
const clean = utils.clean

// Default Values
const MINZOOM = 0
const MAXZOOM = 20
const SPACES = 2
const BBOX = [-180, -85, 180, 85]

/**
 * Get Capabilities
 *
 * @param {Options} options Options
 * @param {string} options.url URL of WMTS service
 * @param {string} options.title Title of service
 * @param {string} options.format Format 'png' | 'jpeg' | 'jpg'
 * @param {number} [options.minzoom=0] Minimum zoom level
 * @param {number} [options.maxzoom=22] Maximum zoom level
 * @param {string} [options.accessConstraints] Access Constraints
 * @param {string} [options.fees] Fees
 * @param {string} [options.abstract] Abstract
 * @param {string} [options.identifier] Identifier
 * @param {string[]} [options.keywords] Keywords
 * @param {BBox} [options.bbox] BBox [west, south, east, north]
 * @param {number} [options.spaces=2] Spaces created for XML output
 * @returns {string} XML string
 * @example
 * const xml = wmts.getCapabilities({
 *   url: 'http://localhost:5000/WMTS',
 *   title: 'Tile Service XYZ',
 *   identifier: 'service-123',
 *   abstract: '© OSM data',
 *   keyword: ['world', 'imagery', 'wmts'],
 *   format: 'png',
 *   minzoom: 10,
 *   maxzoom: 18,
 *   bbox: [-180, -85, 180, 85]
 * })
 */
function getCapabilities (options) {
  // Validation
  options = options || {}
  if (!options.url) throw new Error('<url> is required')
  if (!options.title) throw new Error('<title> required')
  if (!options.format) throw new Error('<format> is required')

  // Define Options
  const spaces = options.spaces || SPACES
  options.url = normalize(options.url)

  // XML header
  const _declaration = {_attributes: { version: '1.0', encoding: 'utf-8' }}

  // Define JSON
  const json = {
    _declaration: _declaration,
    Capabilities: Capabilities(options).Capabilities
  }
  const xml = convert.js2xml(json, { compact: true, spaces: spaces })
  return xml
}

/**
 * Capabilities JSON scheme
 *
 * @private
 * @param {Options} options Options
 * @param {string} options.url URL of WMTS service
 * @returns {ElementCompact} JSON scheme
 * @example
 * Capabilities({
 *   url: 'http://localhost:5000'
 * })
 */
function Capabilities (options) {
  return {
    Capabilities: Object.assign({
      _attributes: {
        xmlns: 'http://www.opengis.net/wmts/1.0',
        'xmlns:ows': 'http://www.opengis.net/ows/1.1',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:gml': 'http://www.opengis.net/gml',
        'xsi:schemaLocation': 'http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd',
        version: '1.0.0'
      }
    },
      ServiceIdentification(options),
      OperationsMetadata(options.url),
      Contents(options),
      {ServiceMetadataURL: {_attributes: { 'xlink:href': options.url + '/1.0.0/WMTSCapabilities.xml' }}}
    )
  }
}

/**
 * GoogleMapsCompatible JSON scheme
 *
 * @private
 * @param {number} [minzoom=0] Minimum zoom level
 * @param {number} [maxzoom=22] Maximum zoom level
 * @returns {ElementCompact} JSON scheme
 * @example
 * wmts.GoogleMapsCompatible(10, 17)
 */
function GoogleMapsCompatible (minzoom, maxzoom) {
  minzoom = (minzoom !== undefined) ? minzoom : MINZOOM
  maxzoom = (maxzoom !== undefined) ? maxzoom : MAXZOOM
  return {
    TileMatrixSet: {
      'ows:Title': {_text: 'GoogleMapsCompatible'},
      'ows:Abstract': {_text: "the wellknown 'GoogleMapsCompatible' tile matrix set defined by OGC WMTS specification"},
      'ows:Identifier': {_text: 'GoogleMapsCompatible'},
      'ows:SupportedCRS': {_text: 'urn:ogc:def:crs:EPSG:6.18.3:3857'},
      WellKnownScaleSet: {_text: 'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible'},
      TileMatrix: TileMatrix(minzoom, maxzoom).TileMatrix
    }
  }
}

/**
 * TileMatrix JSON scheme
 *
 * @private
 * @param {number} [minzoom=0] Minimum zoom level
 * @param {number} [maxzoom=22] Maximum zoom level
 * @returns {ElementCompact} JSON scheme
 * @example
 * wmts.TileMatrix(0, 18)
 */
function TileMatrix (minzoom, maxzoom) {
  minzoom = (minzoom !== undefined) ? minzoom : MINZOOM
  maxzoom = (maxzoom !== undefined) ? maxzoom : MAXZOOM
  const TileMatrix = range(minzoom, maxzoom + 1).map(function (zoom) {
    const matrix = Math.pow(2, zoom)
    const ScaleDenominator = 559082264.0287178 / matrix
    return {
      'ows:Identifier': {_text: String(zoom)},
      ScaleDenominator: {_text: String(ScaleDenominator)},
      TopLeftCorner: {_text: '-20037508.34278925 20037508.34278925'},
      TileWidth: {_text: '256'},
      TileHeight: {_text: '256'},
      MatrixWidth: {_text: String(matrix)},
      MatrixHeight: {_text: String(matrix)}
    }
  })
  return {TileMatrix: TileMatrix}
}

/**
 * ServiceIdentification JSON scheme
 *
 * @private
 * @param {Options} options Options
 * @param {string} options.title Title of service
 * @returns {ElementCompact} JSON scheme
 * @example
 * ServiceIdentification({
 *   title: 'Service name',
 *   abstract: 'A long description of this service',
 *   keywords: ['world', 'wmts', 'imagery']
 * })
 */
function ServiceIdentification (options) {
  return clean({
    'ows:ServiceIdentification': {
      'ows:Title': {_text: options.title},
      'ows:ServiceType': {_text: 'OGC WMTS'},
      'ows:ServiceTypeVersion': {_text: '1.0.0'}
    }
  })
}

/**
 * Keywords JSON scheme
 *
 * @private
 * @param {string[]} [keywords]
 * @returns {ElementCompact} JSON scheme
 * @example
 * Keywords(['world', 'imagery', 'wmts'])
 */
function Keywords (keywords) {
  keywords = keywords || []
  return {
    'ows:Keywords': {
      'ows:Keyword': keywords.map(function (keyword) { return {_text: String(keyword)} })
    }
  }
}

/**
 * OperationsMetadata JSON scheme
 *
 * @private
 * @param {string} url URL of Service Provider
 * @returns {ElementCompact} JSON scheme
 * @example
 * OperationsMetadata('http://localhost:5000/wmts')
 */
function OperationsMetadata (url) {
  return {
    'ows:OperationsMetadata': {
      'ows:Operation': [
        Operation('GetCapabilities', url + '/1.0.0/WMTSCapabilities.xml', url + '?')['ows:Operation'],
        Operation('GetTile', url + '/tile/1.0.0/', url + '?')['ows:Operation']
      ]
    }
  }
}

/**
 * Operation JSON scheme
 *
 * @private
 * @param {string} operation Name of operation
 * @param {string} restful URL for RESTful
 * @param {string} kvp URL for KVP
 * @returns {ElementCompact} JSON scheme
 */
function Operation (operation, restful, kvp) {
  return {
    'ows:Operation': {_attributes: {name: operation},
      'ows:DCP': {
        'ows:HTTP': {
          'ows:Get': [Get(restful, 'RESTful')['ows:Get'], Get(kvp, 'KVP')['ows:Get']]
        }
      }
    }
  }
}

/**
 * Get JSON scheme
 *
 * @private
 * @param {string} url URL of Service Provider
 * @param {string} value Type of Get 'RESTful' | 'KVP'
 * @returns {ElementCompact} JSON scheme
 * @example
 * Get()
 * //= Get > Constraint > AllowedValues> Value
 */
function Get (url, value) {
  return {
    'ows:Get': {_attributes: {'xlink:href': url},
      'ows:Constraint': {_attributes: {name: 'GetEncoding'}},
      'ows:AllowedValues': {
        'ows:Value': {_text: value}
      }
    }
  }
}

/**
 * Capabilities.Contents JSON scheme
 *
 * @private
 * @param {Options} options Options
 * @returns {Element}
 * @example
 * Contents()
 * //= Contents > [Layer, TileMatrixSet, TileMatrixSet]
 */
function Contents (options) {
  return {
    Contents: {
      Layer: Layer(options).Layer,
      TileMatrixSet: GoogleMapsCompatible(options.minzoom, options.maxzoom).TileMatrixSet
    }
  }
}

/**
 * Capabilities.Contents.Layer JSON scheme
 *
 * @private
 * @param {Options} options Options
 * @param {string} options.title Title
 * @param {string} options.url URL
 * @param {string} options.format Format 'png' | 'jpeg' | 'jpg'
 * @param {string} [options.abstract] Abstract
 * @param {string} [options.identifier] Identifier
 * @param {BBox} [options.bbox=[-180, -85, 180, 85]] BBox [west, south, east, north]
 * @returns {ElementCompact} JSON scheme
 * @example
 * Layer({
 *   title: 'Tile Service'
 *   url: 'http://localhost:5000/wmts'
 *   format: 'jpg'
 * })
 */
function Layer (options) {
  // Required options
  const title = options.title
  const url = options.url
  const format = (options.format === 'jpg') ? 'jpeg' : options.format

  // Optional options
  const abstract = options.abstract
  const identifier = options.identifier || title
  const bbox = options.bbox || BBOX
  const bboxMeters = mercator.bboxToMeters(bbox)

  // Derived Variables
  const contentType = 'image/' + format
  const southwest = bbox.slice(0, 2)
  const northeast = bbox.slice(2, 4)
  const southwestMeters = bboxMeters.slice(0, 2)
  const northeastMeters = bboxMeters.slice(2, 4)
  const template = url + '/tile/1.0.0/' + identifier + '/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}'

  return clean({
    Layer: {
      'ows:Title': { _text: title },
      'ows:Identifier': { _text: identifier },
      'ows:Abstract': abstract ? { _text: abstract } : undefined,
      'ows:BoundingBox': { _attributes: { crs: 'urn:ogc:def:crs:EPSG::3857' },
        'ows:LowerCorner': { _text: southwestMeters.join(' ') },
        'ows:UpperCorner': { _text: northeastMeters.join(' ') }
      },
      'ows:WGS84BoundingBox': { _attributes: { crs: 'urn:ogc:def:crs:OGC:2:84' },
        'ows:LowerCorner': { _text: southwest.join(' ') },
        'ows:UpperCorner': { _text: northeast.join(' ') }
      },
      Style: { _attributes: { isDefault: 'true' },
        'ows:Title': { _text: 'Default Style' },
        'ows:Identifier': { _text: 'default' }
      },
      Format: { _text: contentType },
      TileMatrixSetLink: {
        TileMatrixSet: { _text: 'GoogleMapsCompatible' }
      },
      ResourceURL: {_attributes: { format: contentType, resourceType: 'tile', template: template }}
    }
  })
}

module.exports = {
  getCapabilities: getCapabilities,
  Capabilities: Capabilities,
  GoogleMapsCompatible: GoogleMapsCompatible,
  TileMatrix: TileMatrix,
  ServiceIdentification: ServiceIdentification,
  Keywords: Keywords,
  OperationsMetadata: OperationsMetadata,
  Operation: Operation,
  Get: Get,
  Contents: Contents,
  Layer: Layer
}
