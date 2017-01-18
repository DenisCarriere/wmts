import * as convert from 'xml-js'
import { range, clean } from './utils'

/**
 * BBox [west, south, east, north]
 */
export type BBox = [number, number, number, number]

/**
 * Format
 */
export type Format = 'png' | 'jpeg'

/**
 * Options
 */
interface Options extends ServiceIdentificationOptions {
  uri: string
  format: Format
  bbox?: BBox
  spaces?: number
  minzoom?: number
  maxzoom?: number
}

/**
 * ServiceIdentification Options
 */
interface ServiceIdentificationOptions {
  title?: string
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

/**
 * Get Capabilities
 *
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
  const spaces = options.spaces || SPACES
  const declaration = { _attributes: { version: '1.0', encoding: 'utf-8' }}
  const json = {
    declaration,
    Capabilities: Capabilities(options).Capabilities,
  }
  const xml = convert.js2xml(json, { spaces })
  return xml
}

/**
 * Capabilities JSON scheme
 *
 * @param {string} options.uri
 * @returns {ElementCompact}
 * @example
 * Capabilities({
 *   uri: 'http://localhost:5000'
 * })
 */
function Capabilities(options: Options) {
  return {
    Capabilities: {
      _attributes: {
        xmlns: 'http://www.opengis.net/wmts/1.0',
        'xmlns:ows': 'http://www.opengis.net/ows/1.1',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:gml': 'http://www.opengis.net/gml',
        'xsi:schemaLocation': 'http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd',
        version: '1.0.0',
      },
      ServiceMetadataURL: {_attributes: {'xlink:href': `${ options.uri }/1.0.0/WMTSCapabilities.xml`}},
    },
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
  const GoogleMapsCompatible = {
    TileMatrixSet: {
      'ows:Title': {_text: 'GoogleMapsCompatible'},
      'ows:Abstract': {_text: `the wellknown 'GoogleMapsCompatible' tile matrix set defined by OGC WMTS specification`},
      'ows:Identifier': {_text: 'GoogleMapsCompatible'},
      'ows:SupportedCRS': {_text: 'urn:ogc:def:crs:EPSG:6.18.3:3857'},
      WellKnownScaleSet: {_text: 'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible'},
      TileMatrix: TileMatrix(minzoom, maxzoom).TileMatrix,
    },
  }
  return GoogleMapsCompatible
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
 * @param {string} options.title
 * @param {string} options.abstract
 * @param {string[]} options.keywords
 * @param {string} options.accessConstraints
 * @param {string} options.fees
 * @returns {ElementCompact} JSON scheme
 * @example
 * ServiceIdentification({
 *   title: 'Service name',
 *   abstract: 'A long description of this service',
 *   keywords: ['world', 'wmts', 'imagery']
 * })
 */
export function ServiceIdentification(options: ServiceIdentificationOptions = {}) {
  return clean({
    'ows:ServiceIdentification': {
      'ows:ServiceTypeVersion': {_text: '1.0.0'},
      'ows:ServiceType': {_text: 'OGC WMTS'},
      'ows:Title': options.title ? {_text: options.title} : undefined,
      'ows:Abstract': options.abstract ? {_text: options.abstract} : undefined,
      'ows:AccessConstraints': options.accessConstraints ? {_text: options.accessConstraints} : undefined,
      'ows:Fees': options.fees ? {_text: options.fees} : undefined,
      'ows:Keywords': Keywords(options.keywords)['ows:Keywords'],
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
      'ows:Keyword': keywords.map(keyword => { return {_text : String(keyword)} })
    },
  }
}

/**
 * OperationsMetadata JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {ElementCompact} JSON scheme
 * @example
 * OperationsMetadata('http://localhost:5000/wmts')
 */
export function OperationsMetadata(uri: string) {
  uri = uri.replace(/$\//, '') // normalize uri
  return {
    'ows:OperationsMetadata': {
      'ows:Operation': [
        Operation('GetCapabilities', uri + '/1.0.0/WMTSCapabilities.xml', uri + '?')['ows:Operation'],
        Operation('GetTile', uri + '/tile/1.0.0/', uri + '?')['ows:Operation'],
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

// <ows:Get xlink:href="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml">
//   <ows:Constraint name="GetEncoding">
//   <ows:AllowedValues>
//     <ows:Value>RESTful</ows:Value>
//   </ows:AllowedValues>
//   </ows:Constraint>
// </ows:Get>


// ServiceIdentification(options),
// OperationsMetadata(options),
// Contents(options),
// ServiceMetadataURL(options.uri)