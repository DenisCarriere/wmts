const convert = require('xml-js')

interface Attribute {
  [key: string]: string
}

interface Element {
  type: string
  name?: string
  text?: string
  elements?: Array<Element>
  attributes?: Attribute
}

/**
 * ServiceIdentification JSON scheme
 *
 * @param {string} [title]
 * @returns {ServiceIdentification}
 * @examples
 * ServiceIdentification('My Title')
 * //= ServiceIdentification > [Title, ServiceType, ServiceTypeVersion]
 */
function ServiceIdentification (title: string, abstract: string, keywords: Array<any>) {
  // Capabilities.ServiceIdentification.Title
  const Title: Element = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: title }],
  }

  // Capabilities.ServiceIdentification.Abstract
  const Abstract: Element = {
    type: 'element',
    name: 'ows:Abstract',
    elements: [{ type: 'text', text: abstract }],
  }

  // Capabilities.ServiceIdentification.Keywords.Keyword
  function Keyword (text: string): Element {
    return {
      type: 'element',
      name: 'ows:Keyword',
      elements: [{ type: 'text', text: String(text) }],
    }
  }

  // Capabilities.ServiceIdentification.Keywords
  const Keywords: Element = {
    type: 'element',
    name: 'ows:Keywords',
    elements: keywords.map(keyword => Keyword(keyword)),
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

  // Capabilities.ServiceIdentification.Fees
  const Fees: Element = {
    type: 'element',
    name: 'ows:Fees',
    elements: [{ type: 'text', text: 'none' }],
  }

  // Capabilities.ServiceIdentification.AccessConstraints
  const AccessConstraints: Element = {
    type: 'element',
    name: 'ows:AccessConstraints',
    elements: [{ type: 'text', text: 'none' }],
  }

  // Capabilities.ServiceIdentification
  const ServiceIdentification: Element = {
    type: 'element',
    name: 'ows:ServiceIdentification',
    elements: [Title, Abstract, Keywords, ServiceType, ServiceTypeVersion, Fees, AccessConstraints],
  }
  return ServiceIdentification
}

/**
 * ServiceProvider JSON scheme
 *
 * @param {string} name Name of Service Provider
 * @param {string} uri URI of Service Provider
 * @returns {ServiceProvider}
 * @examples
 * ServiceProvider('WMTS Server', 'http://localhost:80/wmts')
 * //= ServiceProvider > [ProviderName, ProviderSite, ServiceContact > IndividualName]
 */
function ServiceProvider (name: string, uri: string) {
  // Capabilities.ServiceProvider.ProviderName
  const ProviderName: Element = {
    type: 'element',
    name: 'ows:ProviderName',
    elements: [{ type: 'text', text: uri }],
  }

  // Capabilities.ServiceProvider.ProviderSite
  const ProviderSite: Element = {
    type: 'element',
    name: 'ows:ProviderSite',
    attributes: { 'xlink:href': uri },
  }

  // Capabilities.ServiceProvider.ServiceContact.IndividualName
  const IndividualName: Element = {
    type: 'element',
    name: 'ows:IndividualName',
    elements: [{ type: 'text', text: name }],
  }

  // Capabilities.ServiceProvider.ServiceContact
  const ServiceContact: Element = {
    type: 'element',
    name: 'ows:ServiceContact',
    elements: [IndividualName],
  }

  // Capabilities.ServiceProvider
  const ServiceProvider: Element = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [ProviderName, ProviderSite, ServiceContact],
  }
  return ServiceProvider
}

/**
 * GetCapabilities JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {OperationsMetadata}
 * @examples
 * Operation()
 * //= Operation > DCP > HTTP > Get > Constraint > AllowedValues> Value
 */
function Operation (name: string, uri: string ): Element {
  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint.AllowedValues.Value
  const Value: Element = {
    type: 'element',
    name: 'ows:Value',
    elements: [{ type: 'text', text: 'KVP' }],
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
  const Get: Element = {
    type: 'element',
    name: 'ows:Get',
    attributes: {
      'xlink:href': `${ uri }?`,
    },
    elements: [Constraint],
  }

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP
  const HTTP: Element = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [Get],
  }

  // Capabilities.OperationsMetadata.Operation.DCP
  const DCP: Element = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [HTTP],
  }

  // Capabilities.OperationsMetadata.Operation
  const GetCapabilities: Element = {
    type: 'element',
    name: 'ows:Operation',
    attributes: {
      name,
    },
    elements: [DCP],
  }
  return GetCapabilities
}

/**
 * OperationsMetadata JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {OperationsMetadata}
 * @examples
 * OperationsMetadata()
 * //= OperationsMetadata > [GetCapabilities, GetTitle, GetFeatureInfo]
 */
function OperationsMetadata (uri: string ): Element {
  // Capabilities.OperationsMetadata
  const OperationsMetadata: Element = {
    type: 'element',
    name: 'ows:OperationsMetadata',
    elements: [Operation('GetCapabilities', uri), Operation('GetTile', uri), Operation('GetFeatureInfo', uri)],
  }
  return OperationsMetadata
}

/**
 * Capabilities JSON scheme
 *
 * @returns {Capabilities}
 * @examples
 * Capabilities()
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
      ServiceIdentification(options.title, options.abstract, options.keywords),
      ServiceProvider(options.name, options.uri),
      OperationsMetadata(options.uri),
    ],
  }
  return Capabilities
}

// ServiceMetadata
// Tile
// FeatureInfo
// GetCapabilities
// GetTile
// GetFeatureInfo

// getCapabilities(request : GetCapabilities) : ServiceMetadata
// getTile(request : GetTile) : Tile Response
// getFeatureInfo(request : GetFeatureInfo) : FeatureInfo Response

interface GetCapabilities {
  title: string
  name: string
  uri: string
  abstract: string
  keywords: Array<any>
}

export function getCapabilities(options: GetCapabilities): string {
  const declaration = { attributes: { version: '1.0', encoding: 'utf-8' }}
  return convert.js2xml({ declaration, elements: [ Capabilities(options) ]}, { compact: false, spaces: 4 })
}

// const wmts = getCapabilities({
//   uri: 'http://localhost:5000/wmts',
//   name: 'Denis',
//   title: 'This is Title',
//   abstract: 'Abstract',
//   keywords: ['words', 1324, 'more words'],
// })

// console.log(wmts)
