import { Element, ElementCompact } from 'xml-js'
import * as convert from 'xml-js'
import { range } from './utils'

// /**
//  * ServiceProvider JSON scheme
//  *
//  * @param {string} name Name of Service Provider
//  * @param {string} uri URI of Service Provider
//  * @returns {ServiceProvider}
//  * @example
//  * ServiceProvider('WMTS Server', 'http://localhost:80/wmts')
//  * //= ServiceProvider > [ProviderName, ProviderSite, ServiceContact > IndividualName]
//  */
// function ServiceProvider (name: string, uri: string) {
//   // Capabilities.ServiceProvider.ProviderName
//   const ProviderName: Element = {
//     type: 'element',
//     name: 'ows:ProviderName',
//     elements: [{ type: 'text', text: uri }],
//   }

//   // Capabilities.ServiceProvider.ProviderSite
//   const ProviderSite: Element = {
//     type: 'element',
//     name: 'ows:ProviderSite',
//     attributes: { 'xlink:href': uri },
//   }

//   // // Capabilities.ServiceProvider.ServiceContact.IndividualName
//   // const IndividualName: Element = {
//   //   type: 'element',
//   //   name: 'ows:IndividualName',
//   //   elements: [{ type: 'text', text: name }],
//   // }

//   // // Capabilities.ServiceProvider.ServiceContact
//   // const ServiceContact: Element = {
//   //   type: 'element',
//   //   name: 'ows:ServiceContact',
//   //   elements: [IndividualName],
//   // }

//   // Capabilities.ServiceProvider
//   const ServiceProvider: Element = {
//     type: 'element',
//     name: 'ows:ServiceProvider',
//     elements: [ProviderName, ProviderSite],
//   }
//   return ServiceProvider
// }



/**
 * Capabilities.Contents.Layer JSON scheme
 *
 * @param {string} title Title of Service
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Layer()
 * //= Layer > [Layer, TileMatrixSet, TileMatrixSet]
 */
function Layer (options: GetCapabilities): Element {
  const Tile: Element = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: options.title }],
  }

  // Capabilities.Contents.Layer.Identifier
  const Identifier: Element = {
    type: 'element',
    name: 'ows:Identifier',
    elements: [{ type: 'text', text: options.title }],
  }

  function Corner(name: string, lnglat: [number, number]) {
    return {
      type: 'element',
      name,
      elements: [{ type: 'text', text: lnglat.join(' ') }],
    }
  }

  // Capabilities.Contents.Layer.BoundingBox
  const BoundingBox: Element = {
    type: 'element',
    name: 'ows:BoundingBox',
    attributes: { crs: 'urn:ogc:def:crs:EPSG::3857' },
    elements: [
      Corner('ows:LowerCorner', [-2.0037507067161843E7, -1.9971868880408604E7]),
      Corner('ows:UpperCorner', [2.0037507067161843E7, 1.997186888040863E7]),
    ],
  }

  // Capabilities.Contents.Layer.WGS84BoundingBox
  const WGS84BoundingBox: Element = {
    type: 'element',
    name: 'ows:WGS84BoundingBox',
    attributes: { crs: 'urn:ogc:def:crs:OGC:2:84' },
    elements: [
      Corner('ows:LowerCorner', [-179.9999885408441, -85.00000000000003]),
      Corner('ows:UpperCorner', [179.9999885408441, 85.00000000000006]),
    ],
  }

  // Capabilities.Contents.Layer.Style
  const Style: Element = {
    type: 'element',
    name: 'Style',
    attributes: { isDefault: 'true' },
    elements: [
      { type: 'element', name: 'ows:Title', elements: [{ type: 'text', text: 'Default Style' }]},
      { type: 'element', name: 'ows:Identifier', elements: [{ type: 'text', text: 'default' }]},
    ],
  }

  // Capabilities.Contents.Layer.Format
  const Format = {
    type: 'element',
    name: 'Format',
    elements: [{ type: 'text', text: `image/${options.format}` }],
  }

  // Capabilities.Contents.Layer.TileMatrixSetLink
  function TileMatrixSetLink(name: string): Element {
    return {
      type: 'element',
      name: 'TileMatrixSetLink',
      elements: [
        { type: 'element', name: 'TileMatrixSet', elements: [{ type: 'text', text: name }]},
      ],
    }
  }

  // Capabilities.Contents.Layer.ResourceURL
  const ResourceURL = {
    type: 'element',
    name: 'ResourceURL',
    attributes: {
      format: `image/${options.format}`,
      resourceType: 'tile',
      template: `${ options.uri }/tile/1.0.0/${ options.title }/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.${options.format}`,
    },
  }

  // Capabilities.Contents.Layer
  const Layer: Element = {
    type: 'element',
    name: 'Layer',
    elements: [
      Tile,
      Identifier,
      BoundingBox,
      WGS84BoundingBox,
      Style,
      Format,
      TileMatrixSetLink('default028mm'),
      TileMatrixSetLink('GoogleMapsCompatible'),
      ResourceURL,
    ],
  }
  return Layer
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
 * Capabilities.Contents JSON scheme
 *
 * @param {string} title Title of Service
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Contents()
 * //= Contents > [Layer, TileMatrixSet, TileMatrixSet]
 */
function Contents (options: GetCapabilities): Element {
  const Contents: Element = {
    type: 'element',
    name: 'Contents',
    elements: [
      Layer(options),
      GoogleMapsCompatible(options.minzoom, options.maxzoom),
    ],
  }
  return Contents
}

/**
 * Capabilities.ServiceMetadataURL
 *
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * ServiceMetadataURL(options)
 * //= ServiceMetadataURL
 */
export function ServiceMetadataURL (uri: string): ElementCompact {
  return {
    ServiceMetadataURL: {
      _attributes: {'xlink:href': `${ uri }/1.0.0/WMTSCapabilities.xml`},
    },
  }
}

/**
 * Capabilities JSON scheme
 *
 * @param {GetCapabilities} options
 * @returns {Element}
 * @example
 * Capabilities(options)
 * //= Capabilities > [ServiceIdentification, ServiceProvider, OperationsMetadata]
 */
function Capabilities(options: GetCapabilities): Element {
  const Capabilities: Element = {
    type: 'element',
    name: 'Capabilities',
    attributes: {
      xmlns: 'http://www.opengis.net/wmts/1.0',
      'xmlns:ows': 'http://www.opengis.net/ows/1.1',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:gml': 'http://www.opengis.net/gml',
      'xsi:schemaLocation': 'http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd',
      version: '1.0.0',
    },
    elements: [
      ServiceIdentification(options),
      OperationsMetadata(options),
      Contents(options),
      ServiceMetadataURL(options.uri),
    ],
  }
  return Capabilities
}

interface GetCapabilities {
  title: string
  uri: string
  format: 'png' | 'jpeg' | 'jpg'
  name?: string
  abstract?: string
  keywords?: Array<any>
  bbox?: BBox
  minzoom?: number
  maxzoom?: number
}
