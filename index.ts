import { Element } from 'xml-js'
import * as convert from 'xml-js'

type BBox = [number, number, number, number]

/**
 * Generate an integer Array containing an arithmetic progression.
 *
 * @private
 * @param {number} [start=0] Start
 * @param {number} stop Stop
 * @param {number} [step=1] Step
 * @returns {Array<number>} range
 * @example
 * range(3)
 * //=[ 0, 1, 2 ]
 * range(3, 6)
 * //=[ 3, 4, 5 ]
 * range(6, 3, -1)
 * //=[ 6, 5, 4 ]
 */
export function range(start: number, stop?: number, step?: number): number[] {
  if (stop == null) {
    stop = start || 0
    start = 0
  }
  if (!step) {
    step = stop < start ? -1 : 1
  }

  const length = Math.max(Math.ceil((stop - start) / step), 0)
  const range = Array(length)

  for (let idx = 0; idx < length; idx++, start += step) {
    range[idx] = start
  }
  return range
}

/**
 * ServiceIdentification JSON scheme
 *
 * @param {string} title Title of service
 * @returns {Element}
 * @example
 * ServiceIdentification('My Title')
 * //= ServiceIdentification > [Title, ServiceType, ServiceTypeVersion]
 */
function ServiceIdentification (options: GetCapabilities) {
  // // Capabilities.ServiceIdentification.Abstract
  // const Abstract: Element = {
  //   type: 'element',
  //   name: 'ows:Abstract',
  //   elements: [{ type: 'text', text: abstract }],
  // }

  // // Capabilities.ServiceIdentification.Keywords.Keyword
  // function Keyword (text: string): Element {
  //   return {
  //     type: 'element',
  //     name: 'ows:Keyword',
  //     elements: [{ type: 'text', text: String(text) }],
  //   }
  // }

  // // Capabilities.ServiceIdentification.Keywords
  // const Keywords: Element = {
  //   type: 'element',
  //   name: 'ows:Keywords',
  //   elements: keywords.map(keyword => Keyword(keyword)),
  // }

  // // Capabilities.ServiceIdentification.Fees
  // const Fees: Element = {
  //   type: 'element',
  //   name: 'ows:Fees',
  //   elements: [{ type: 'text', text: 'none' }],
  // }

  // // Capabilities.ServiceIdentification.AccessConstraints
  // const AccessConstraints: Element = {
  //   type: 'element',
  //   name: 'ows:AccessConstraints',
  //   elements: [{ type: 'text', text: 'none' }],
  // }

  // Capabilities.ServiceIdentification.Title
  const Title: Element = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: options.title }],
  }

  // Capabilities.ServiceIdentification.ServiceType
  const ServiceType: Element = {
    type: 'element',
    name: 'ows:ServiceType',
    elements: [{ type: 'text', text: 'OGC WMTS' }],
  }

  // Capabilities.ServiceIdentification.ServiceTypeVersion
  const ServiceTypeVersion: Element = {
    type: 'element',
    name: 'ows:ServiceTypeVersion',
    elements: [{ type: 'text', text: '1.0.0' }],
  }

  // Capabilities.ServiceIdentification
  const ServiceIdentification: Element = {
    type: 'element',
    name: 'ows:ServiceIdentification',
    elements: [Title, ServiceType, ServiceTypeVersion],
  }
  return ServiceIdentification
}

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
 * Get JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @param {string} value Type of Get
 * @returns {Element}
 * @example
 * Get()
 * //= Get > Constraint > AllowedValues> Value
 */
function Get (uri: string, value: string): Element {
  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint.AllowedValues.Value
  const Value: Element = {
    type: 'element',
    name: 'ows:Value',
    elements: [{ type: 'text', text: value }],
  }
  /**
   * TO DO: Text value was originally KVP (does it stand for anything?)
   */

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint.AllowedValues
  const AllowedValues: Element = {
    type: 'element',
    name: 'ows:AllowedValues',
    elements: [Value],
  }

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint
  const Constraint: Element = {
    type: 'element',
    name: 'ows:Constraint',
    attributes: {
      name: 'GetEncoding',
    },
    elements: [AllowedValues],
  }

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get
  const Get = {
    type: 'element',
    name: 'ows:Get',
    attributes: {
      'xlink:href': uri,
    },
    elements: [Constraint],
  }
  return Get
}

/**
 * Operation JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Operation()
 * //= Operation > DCP > HTTP > Get
 */
function Operation (operation: string, rest: string, kvp: string): Element {
  // Capabilities.OperationsMetadata.Operation.DCP.HTTP
  const HTTP: Element = {
    type: 'element',
    name: 'ows:HTTP',
    elements: [Get(rest, 'RESTful'), Get(kvp, 'KVP')],
  }

  // Capabilities.OperationsMetadata.Operation.DCP
  const DCP: Element = {
    type: 'element',
    name: 'ows:DCP',
    elements: [HTTP],
  }

  // Capabilities.OperationsMetadata.Operation
  const Operation: Element = {
    type: 'element',
    name: 'ows:Operation',
    attributes: {
      name: operation,
    },
    elements: [DCP],
  }
  return Operation
}

/**
 * OperationsMetadata JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * OperationsMetadata()
 * //= OperationsMetadata > [GetCapabilities, GetTitle, GetFeatureInfo]
 */
function OperationsMetadata (options: GetCapabilities): Element {
  const { uri } = options
  // Capabilities.OperationsMetadata
  const OperationsMetadata: Element = {
    type: 'element',
    name: 'ows:OperationsMetadata',
    elements: [
      Operation('GetCapabilities', `${ uri }/1.0.0/WMTSCapabilities.xml`, `${ uri }?`),
      Operation('GetTile', `${ uri }/tile/1.0.0/`, `${ uri }?`),
    ],
  }
  return OperationsMetadata
}

/**
 * Layer JSON scheme
 *
 * @param {string} title Title of Service
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Layer()
 * //= Layer > [Layer, TileMatrixSet, TileMatrixSet]
 */
function Layer (options: GetCapabilities): Element {
  // Capabilities.Contents.Layer.Tile
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
    elements: [{ type: 'text', text: 'image/jpeg' }],
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
      format: 'image/jpeg',
      resourceType: 'tile',
      template: `${ options.uri }/tile/1.0.0/${ options.title }/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg`,
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
 * default028mm JSON scheme
 *
 * @returns {Element}
 * @example
 * default028mm(options)
 * //= TileMatrixSet > [Title, Abstract, Identifier, SupportedCRS, WellKnownScaleSet, TileMatrix[]]
 */
function default028mm (options: GetCapabilities): Element {
  // Capabilities.Contents.TileMatrixSet.Ttile
  const Title: Element = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: 'TileMatrix using 0.28mm' }],
  }

  // Capabilities.Contents.Abstract
  const Abstract: Element = {
    type: 'element',
    name: 'ows:Abstract',
    elements: [{ type: 'text', text: `The tile matrix set that has scale values calculated based on the dpi defined ` +
                                     `by OGC specification (dpi assumes 0.28mm as the physical distance of a pixel).` }],
  }

  // Capabilities.Contents.Identifier
  const Identifier: Element = {
    type: 'element',
    name: 'ows:Identifier',
    elements: [{ type: 'text', text: 'default028mm' }],
  }

  // Capabilities.Contents.SupportedCRS
  const SupportedCRS: Element = {
    type: 'element',
    name: 'ows:SupportedCRS',
    elements: [{ type: 'text', text: 'urn:ogc:def:crs:EPSG::3857' }],
  }

  // Capabilities.Contents.default028mm
  const default028mm: Element = {
    type: 'element',
    name: 'TileMatrixSet',
    elements: [
      Title,
      Abstract,
      Identifier,
      SupportedCRS,
    ].concat(TileMatrixSet(options.minZoom, options.maxZoom, true)),
  }

  return default028mm
}

/**
 * TileMatrixSet JSON scheme
 *
 * @param {number} minZoom
 * @param {number} maxZoom
 * @returns {Element[]}
 * @example
 * TileMatrixSet(0, 18)
 * //= TileMatrixSet > [ows:Identifier, ScaleDenominator, TopLeftCorner, TileWidth, TileHeight, MatrixWidth, MatrixHeight]
 */
function TileMatrixSet (minZoom = 0, maxZoom = 18, default028mm = false): Element[] {
  return range(minZoom, maxZoom + 1).map(zoom => {
    const matrix = Math.pow(2, zoom)
    const ScaleDenominator = 559082264.0287178 / matrix
    interface MatrixHeight {
      [key: number]: number
    }
    const MatrixHeight: MatrixHeight = {
      0: 1,
      1: 2,
      2: 4,
      3: 8,
      4: 16,
      5: 32,
      6: 64,
      7: 128,
      8: 256,
      9: 512,
      10: 1023,
      11: 2045,
      12: 4090,
      13: 8179,
      14: 16358,
      15: 32715,
      16: 65429,
      17: 130858,
      18: 261715,
      19: 523430,
      20: 1046859,
      21: 2093718,
      22: 4187435,
      23: 8374869,
    }

    return {
      type: 'element',
      name: 'TileMatrix',
      elements: [
        { type: 'element', name: 'ows:Identifier', elements: [{ type: 'text', text: String(zoom) }]},
        { type: 'element', name: 'ScaleDenominator', elements: [{ type: 'text', text: String(ScaleDenominator) }]},
        { type: 'element', name: 'TopLeftCorner', elements: [{ type: 'text', text: '-20037508.34278925 20037508.34278925' }]},
        { type: 'element', name: 'TileWidth', elements: [{ type: 'text', text: '256' }]},
        { type: 'element', name: 'TileHeight', elements: [{ type: 'text', text: '256' }]},
        { type: 'element', name: 'MatrixWidth', elements: [{ type: 'text', text: String(matrix) }]},
        { type: 'element', name: 'MatrixHeight', elements: [{ type: 'text', text: (default028mm) ? String(MatrixHeight[zoom]) : String(matrix) }]},
      ],
    }
  })
}

/**
 * GoogleMapsCompatible JSON scheme
 *
 * @returns {Element}
 * @example
 * GoogleMapsCompatible(options)
 * //= TileMatrixSet > [Title, Abstract, Identifier, SupportedCRS, WellKnownScaleSet, TileMatrix[]]
 */
function GoogleMapsCompatible (options: GetCapabilities): Element {
  // Capabilities.Contents.TileMatrixSet.Ttile
  const Title: Element = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: 'GoogleMapsCompatible' }],
  }

  // Capabilities.Contents.Abstract
  const Abstract: Element = {
    type: 'element',
    name: 'ows:Abstract',
    elements: [{ type: 'text', text: `the wellknown 'GoogleMapsCompatible' tile matrix set defined by OGC WMTS specification` }],
  }

  // Capabilities.Contents.Identifier
  const Identifier: Element = {
    type: 'element',
    name: 'ows:Identifier',
    elements: [{ type: 'text', text: 'GoogleMapsCompatible' }],
  }

  // Capabilities.Contents.SupportedCRS
  const SupportedCRS: Element = {
    type: 'element',
    name: 'ows:SupportedCRS',
    elements: [{ type: 'text', text: 'urn:ogc:def:crs:EPSG:6.18.3:3857' }],
  }

  // Capabilities.Contents.WellKnownScaleSet
  const WellKnownScaleSet: Element = {
    type: 'element',
    name: 'WellKnownScaleSet',
    elements: [{ type: 'text', text: 'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible' }],
  }

  // Capabilities.Contents.GoogleMapsCompatible
  const GoogleMapsCompatible: Element = {
    type: 'element',
    name: 'TileMatrixSet',
    elements: [
      Title,
      Abstract,
      Identifier,
      SupportedCRS,
      WellKnownScaleSet,
    ].concat(TileMatrixSet(options.minZoom, options.maxZoom)),
  }

  return GoogleMapsCompatible
}

/**
 * Contents JSON scheme
 *
 * @param {string} title Title of Service
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * Contents()
 * //= Contents > [Layer, TileMatrixSet, TileMatrixSet]
 */
function Contents (options: GetCapabilities): Element {
  // Capabilities.Contents
  const Contents: Element = {
    type: 'element',
    name: 'Contents',
    elements: [
      Layer(options),
      default028mm(options),
      GoogleMapsCompatible(options),
    ],
  }
  return Contents
}

/**
 * ServiceMetadataURL JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {Element}
 * @example
 * ServiceMetadataURL()
 * //= ServiceMetadataURL
 */
function ServiceMetadataURL (options: GetCapabilities): Element {
  // Capabilities.ServiceMetadataURL
  const ServiceMetadataURL: Element = {
    type: 'element',
    name: 'ServiceMetadataURL',
    attributes: {
      'xlink:href': `${ options.uri }/1.0.0/WMTSCapabilities.xml`,
    },
  }
  return ServiceMetadataURL
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
      ServiceMetadataURL(options),
    ],
  }
  return Capabilities
}

interface GetCapabilities {
  title: string
  uri: string
  name?: string
  abstract?: string
  keywords?: Array<any>
  bbox?: BBox
  minZoom?: number,
  maxZoom?: number,
}

export function getCapabilities(options: GetCapabilities): string {
  const declaration = { attributes: { version: '1.0', encoding: 'utf-8' }}
  const xml = convert.js2xml({ declaration, elements: [ Capabilities(options) ]}, { spaces: 0 })
  return xml
}

const wmts = getCapabilities({
  uri: 'http://localhost:5000/WMTS',
  title: 'service_name',
})
