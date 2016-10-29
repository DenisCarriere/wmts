const convert = require('xml-js')

const TITLE = 'Web Map Tile Service'
const NAME = 'WMTS Server'
const SCHEME = 'http'
const HOST = 'localhost'
const PORT = 80
const PATH = '/wmts'
const URI = `${ SCHEME }://${ HOST }:${ PORT }${ PATH }` // http://localhost:80/wmts

/**
 * ServiceIdentification JSON scheme
 *
 * @param {string} [title]
 * @returns {ServiceIdentification}
 * @examples
 * ServiceIdentification('My Title')
 * //= ServiceIdentification > [Title, ServiceType, ServiceTypeVersion]
 */
function ServiceIdentification (title = TITLE) {
  // Capabilities.ServiceIdentification.Title
  const Title = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: title }],
  }

  // Capabilities.ServiceIdentification.ServiceType
  const ServiceType = {
    type: 'element',
    name: 'ows:ServiceType',
    elements: [{ type: 'text', text: 'OGC WMTS' }],
  }

  // Capabilities.ServiceIdentification.ServiceTypeVersion
  const ServiceTypeVersion = {
    type: 'element',
    name: 'ows:ServiceTypeVersion',
    elements: [{ type: 'text', text: '1.0.0' }],
  }

  // Capabilities.ServiceIdentification
  const ServiceIdentification = {
    type: 'element',
    name: 'ows:ServiceIdentification',
    elements: [Title, ServiceType, ServiceTypeVersion],
  }
  return ServiceIdentification

// WMTS page 32
// TODO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// <ows:ServiceIdentification>
//   <ows:Title>World example Web Map Tile Service</ows:Title>
//   <ows:Abstract>
//     Example service that constrains some world layers in the
//     GlobalCRS84Pixel Well-known scale set
//   </ows:Abstract>
//   <ows:Keywords>
//     <ows:Keyword>World</ows:Keyword>
//     <ows:Keyword>Global</ows:Keyword>
//     <ows:Keyword>Digital Elevation Model</ows:Keyword>
//     <ows:Keyword>Administrative Boundaries</ows:Keyword>
//   </ows:Keywords>
//   <ows:ServiceType>OGC WMTS</ows:ServiceType>
//   <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
//   <ows:Fees>none</ows:Fees>
//   <ows:AccessConstraints>none</ows:AccessConstraints>
// </ows:ServiceIdentification>
// TODO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
function ServiceProvider (name = NAME, uri = URI) {
  // Capabilities.ServiceProvider.ProviderName
  const ProviderName = {
    type: 'element',
    name: 'ows:ProviderName',
    elements: [{ type: 'text', text: uri }],
  }

  // Capabilities.ServiceProvider.ProviderSite
  const ProviderSite = {
    type: 'element',
    name: 'ows:ProviderSite',
    attributes: { 'xlink:href': uri },
  }

  // Capabilities.ServiceProvider.ServiceContact.IndividualName
  const IndividualName = {
    type: 'element',
    name: 'ows:IndividualName',
    elements: [{ type: 'text', text: name }],
  }

  // Capabilities.ServiceProvider.ServiceContact
  const ServiceContact = {
    type: 'element',
    name: 'ows:ServiceContact',
    elements: [IndividualName],
  }

  // Capabilities.ServiceProvider
  const ServiceProvider = {
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
function Operation (name: string, uri = URI ) {
  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint.AllowedValues.Value
  const Value = {
    type: 'element',
    name: 'ows:Value',
    elements: [{ type: 'text', text: 'KVP' }],
  }
  /**
   * TO DO: Text value was originally KVP (does it stand for anything?)
   */

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint.AllowedValues
  const AllowedValues = {
    type: 'element',
    name: 'ows:AllowedValues',
    elements: [Value],
  }

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP.Get.Constraint
  const Constraint = {
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
      'xlink:href': `${ uri }?`,
    },
    elements: [Constraint],
  }

  // Capabilities.OperationsMetadata.Operation.DCP.HTTP
  const HTTP = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [Get],
  }

  // Capabilities.OperationsMetadata.Operation.DCP
  const DCP = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [HTTP],
  }

  // Capabilities.OperationsMetadata.Operation
  const GetCapabilities = {
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
function OperationsMetadata (uri = URI ) {
  // Capabilities.OperationsMetadata
  const OperationsMetadata = {
    type: 'element',
    name: 'ows:OperationsMetadata',
    elements: [Operation('GetCapabilities'), Operation('GetTile'), Operation('GetFeatureInfo')],
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
function Capabilities() {
  const Capabilities = {
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
    elements: [ ServiceIdentification(), ServiceProvider(), OperationsMetadata() ],
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

export function getCapabilities() {
  const options = { compact: false, spaces: 4 }
  const declaration = { attributes: { version: '1.0', encoding: 'utf-8' }}
  return convert.js2xml({ declaration, elements: [ Capabilities() ]}, options)
}
