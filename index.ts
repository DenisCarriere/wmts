import * as convert from 'xml-js'
import * as mercator from 'global-mercator'
import { range, clean, error, normalize } from './utils'

/**
 * BBox [west, south, east, north]
 */
export type BBox = [number, number, number, number]

/**
 * Format
 */
export type Format = 'png' | 'jpeg' | 'jpg'

/**
 * Options
 */
interface Options extends ServiceIdentificationOptions, LayerOptions {
  spaces?: number
  minzoom?: number
  maxzoom?: number
}

/**
 * Layer Options
 */
interface LayerOptions {
  title: string
  url: string
  format: Format
  abstract?: string
  identifier?: string
  bbox?: BBox
}

/**
 * ServiceIdentification Options
 */
interface ServiceIdentificationOptions {
  title: string
  abstract?: string
  keywords?: string[]
  accessConstraints?: string
  fees?: string
}

/**
 * Default Values
 */
const MINZOOM = 0
const MAXZOOM = 20
const SPACES = 2
const BBOX: BBox = [-180, -85, 180, 85]

/**
 * Get Capabilities
 *
 * @param {Options} options Options
 * @param {number} [options.spaces=2] Spaces created for XML output
 * @returns {string} XML string
 * @example
 * const xml = wmts.getCapabilities({
 *   uri: 'http://localhost:5000/WMTS',
 *   title: 'service_name',
 *   format: 'png',
 *   minzoom: 10,
 *   maxzoom: 18
 * })
 */
export function getCapabilities(options: Options): string {
  // Define Options
  const spaces = options.spaces || SPACES

  // XML header
  const declaration = { _attributes: { version: '1.0', encoding: 'utf-8' }}

  // Define JSON
  const json = {
    declaration,
    Capabilities: Capabilities(options).Capabilities,
  }
  const xml = convert.js2xml(json, { compact: true, spaces })
  return xml
}

/**
 * Capabilities JSON scheme
 *
 * @param {Options} options Options
 * @param {string} options.url <required>
 * @returns {ElementCompact} JSON scheme
 * @example
 * Capabilities({
 *   url: 'http://localhost:5000'
 * })
 */
export function Capabilities(options: Options) {
  // Required options
  const url = normalize(options.url)
  if (!url) { error('<url> is required') }

  return {
    Capabilities: Object.assign({
      _attributes: {
        xmlns: 'http://www.opengis.net/wmts/1.0',
        'xmlns:ows': 'http://www.opengis.net/ows/1.1',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:gml': 'http://www.opengis.net/gml',
        'xsi:schemaLocation': 'http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd',
        version: '1.0.0',
      },
      ServiceMetadataURL: { _attributes: { 'xlink:href':  url + '/1.0.0/WMTSCapabilities.xml' }},
    },
      ServiceIdentification(options),
      OperationsMetadata(url),
      Contents(options)
    ),
  }
}

/**
 * GoogleMapsCompatible JSON scheme
 *
 * @param {number} minzoom Minimum zoom level
 * @param {number} maxzoom Maximum zoom level
 * @returns {ElementCompact} JSON scheme
 * @example
 * wmts.GoogleMapsCompatible(10, 17)
 */
export function GoogleMapsCompatible(minzoom: number, maxzoom: number) {
  return {
    TileMatrixSet: {
      'ows:Title': {_text: 'GoogleMapsCompatible'},
      'ows:Abstract': {_text: `the wellknown 'GoogleMapsCompatible' tile matrix set defined by OGC WMTS specification`},
      'ows:Identifier': {_text: 'GoogleMapsCompatible'},
      'ows:SupportedCRS': {_text: 'urn:ogc:def:crs:EPSG:6.18.3:3857'},
      WellKnownScaleSet: {_text: 'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible'},
      TileMatrix: TileMatrix(minzoom, maxzoom).TileMatrix,
    },
  }
}

/**
 * TileMatrix JSON scheme
 *
 * @param {number} minzoom Minimum zoom level
 * @param {number} maxzoom Maximum zoom level
 * @returns {ElementCompact} JSON scheme
 * @example
 * wmts.TileMatrix(0, 18)
 */
export function TileMatrix(minzoom: number, maxzoom: number) {
  const TileMatrix = range(minzoom, maxzoom + 1).map(zoom => {
    const matrix = Math.pow(2, zoom)
    const ScaleDenominator = 559082264.0287178 / matrix
    return {
      'ows:Identifier': {_text: String(zoom)},
      ScaleDenominator: {_text: String(ScaleDenominator)},
      TopLeftCorner: {_text: '-20037508.34278925 20037508.34278925'},
      TileWidth: {_text: '256'},
      TileHeight: {_text: '256'},
      MatrixWidth: {_text: String(matrix)},
      MatrixHeight: {_text: String(matrix)},
    }
  })
  return {
    TileMatrix,
  }
}

/**
 * ServiceIdentification JSON scheme
 *
 * @param {Options} options Options
 * @param {string} options.title [required] Title
 * @param {string} options.abstract Abstract
 * @param {string[]} options.keywords Keywords
 * @param {string} options.accessConstraints Access Constraints
 * @param {string} options.fees Fees
 * @returns {ElementCompact} JSON scheme
 * @example
 * ServiceIdentification({
 *   title: 'Service name',
 *   abstract: 'A long description of this service',
 *   keywords: ['world', 'wmts', 'imagery']
 * })
 */
export function ServiceIdentification(options: ServiceIdentificationOptions) {
  // Required options
  const title = options.title || error('<title> required')

  // Optional options
  const abstract = options.abstract
  const accessConstraints = options.accessConstraints
  const fees = options.fees
  const keywords = options.keywords

  return clean({
    'ows:ServiceIdentification': {
      'ows:ServiceTypeVersion': {_text: '1.0.0'},
      'ows:ServiceType': {_text: 'OGC WMTS'},
      'ows:Title': title ? {_text: title} : undefined,
      'ows:Abstract': abstract ? {_text: abstract} : undefined,
      'ows:AccessConstraints': accessConstraints ? {_text: accessConstraints} : undefined,
      'ows:Fees': fees ? {_text: fees} : undefined,
      'ows:Keywords': Keywords(keywords)['ows:Keywords'],
    },
  })
}

/**
 * Keywords JSON scheme
 *
 * @param {string[]} keywords
 * @returns {ElementCompact} JSON scheme
 * @example
 * Keywords(['world', 'imagery', 'wmts'])
 */
export function Keywords(keywords: string[] = []) {
  return {
    'ows:Keywords': {
      'ows:Keyword': keywords.map(keyword => { return {_text : String(keyword)} }),
    },
  }
}

/**
 * OperationsMetadata JSON scheme
 *
 * @param {string} url URL of Service Provider
 * @returns {ElementCompact} JSON scheme
 * @example
 * OperationsMetadata('http://localhost:5000/wmts')
 */
export function OperationsMetadata(url: string) {
  url = normalize(url)
  if (!url) { error('<url> is required') }
  return {
    'ows:OperationsMetadata': {
      'ows:Operation': [
        Operation('GetCapabilities', url + '/1.0.0/WMTSCapabilities.xml', url + '?')['ows:Operation'],
        Operation('GetTile', url + '/tile/1.0.0/', url + '?')['ows:Operation'],
      ],
    },
  }
}

/**
 * Operation JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {ElementCompact} JSON scheme
 * @example
 * Operation()
 */
export function Operation(operation: string, restful: string, kvp: string) {
  return {
    'ows:Operation': {_attributes: {name: operation},
      'ows:DCP': {
        'ows:HTTP': {
          'ows:Get': [Get(restful, 'RESTful')['ows:Get'], Get(kvp, 'KVP')['ows:Get']],
        },
      },
    },
  }
}

/**
 * Get JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @param {string} value Type of Get
 * @returns {ElementCompact} JSON scheme
 * @example
 * Get()
 * //= Get > Constraint > AllowedValues> Value
 */
export function Get(uri: string, value: 'RESTful' | 'KVP') {
  return {
    'ows:Get': {_attributes: {'xlink:href': uri},
      'ows:Constraint': { _attributes: {name: 'GetEncoding'}},
      'ows:AllowedValues': {
        'ows:Value': {_text: value},
      },
    },
  }
}

/**
 * Capabilities.Contents JSON scheme
 *
 * @param {Options} options Options
 * @param {string} title Title of Service
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Contents()
 * //= Contents > [Layer, TileMatrixSet, TileMatrixSet]
 */
export function Contents(options: Options) {
  const minzoom = options.minzoom || MINZOOM
  const maxzoom = options.maxzoom || MAXZOOM
  return {
    Contents: {
      Layer: Layer(options).Layer,
      TileMatrixSet: GoogleMapsCompatible(minzoom, maxzoom).TileMatrixSet,
    },
  }
}

/**
 * Capabilities.Contents.Layer JSON scheme
 *
 * @param {Options} options Options
 * @param {string} options.title [required] Title
 * @param {string} options.url [required] URL
 * @param {string} options.format [required] Format 'png' | 'jpeg' | 'jpg'
 * @param {string} options.abstract Abstract
 * @param {string} options.identifier Identifier
 * @param {BBox} options.bbox BBox [west, south, east, north]
 * @returns {ElementCompact} JSON scheme
 * @example
 * Layer({
 *   title: 'Tile Service'
 *   url: 'http://localhost:5000/wmts'
 *   format: 'jpg'
 * })
 */
export function Layer(options: LayerOptions) {
  // Required options
  const title = options.title || error('<title> is required')
  const url = options.url || error('<url> is required')
  const format = options.format || error('<format> is required')

  // Optional options
  const abstract = options.abstract
  const identifier = options.identifier
  const bbox: BBox = options.bbox || BBOX

  // Derived Variables
  const contentType = `image/${(format === 'jpg') ? 'jpeg' : format}`
  const southwest: [number, number] = [bbox[0], bbox[1]]
  const northeast: [number, number] = [bbox[2], bbox[3]]
  const template = url + `/tile/1.0.0/${identifier}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.` + options.format

  return clean({
    Layer: {
      'ows:Title': { _text: title },
      'ows:Identifier': identifier ? { _text: identifier } : undefined,
      'ows:Abstract': abstract ? { _text: abstract } : undefined,
      'ows:BoundingBox': { _attributes: { crs: 'urn:ogc:def:crs:EPSG::3857' },
        'ows:LowerCorner': { _text: mercator.lngLatToMeters(southwest).join(',') },
        'ows:UpperCorner': { _text: mercator.lngLatToMeters(northeast).join(',') },
      },
      'ows:WGS84BoundingBox': { _attributes: { crs: 'urn:ogc:def:crs:OGC:2:84' },
        'ows:LowerCorner': { _text: southwest.join(',') },
        'ows:UpperCorner': { _text: northeast.join(',') },
      },
      Style: { _attributes: { isDefault: 'true' },
        'ows:Title': { _text: 'Default Style' },
        'ows:Identifier': { _text: 'default' },
      },
      Format: { _text: contentType },
      TileMatrixSetLink: {
        TileMatrixSet: { _text: 'GoogleMapsCompatible' },
      },
      ResourceURL: { _attributes: { format: contentType, resourceType: 'tile', template }},
    },
  })
}
