const convert = require('xml-js')

// scheme:[//[user:password@]host[:port]][/]path[?query][#fragment]
const TITLE = 'Web Map Tile Service'
const NAME = 'WMTS Server'
const SCHEME = 'http'
const HOST = 'localhost'
const PORT = 80
const PATH = '/wmts'
const URI = `${ SCHEME }://${ HOST }:${ PORT }${ PATH }`
// http://localhost:80/wmts

/**
 * ServiceIdentification JSON scheme
 *
 * @param {string} [title]
 * @returns {ServiceIdentification}
 * @examples
 * ServiceIdentification('My Title')
 * //{
 * //  ServiceIdentification: [
 * //    Title
 * //    ServiceType
 * //    ServiceTypeVersion
 * //  ]
 * //}
 */
function ServiceIdentification (title = TITLE) {
  const Title = {
    type: 'element',
    name: 'ows:Title',
    elements: [{ type: 'text', text: title }],
  }

  const ServiceType = {
    type: 'element',
    name: 'ows:ServiceType',
    elements: [{ type: 'text', text: 'OGC WMTS' }],
  }

  const ServiceTypeVersion = {
    type: 'element',
    name: 'ows:ServiceTypeVersion',
    elements: [{ type: 'text', text: '1.0.0' }],
  }

  const ServiceIdentification = {
    type: 'element',
    name: 'ows:ServiceIdentification',
    elements: [Title, ServiceType, ServiceTypeVersion],
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
 * //{
 * //  ServiceProvider: [
 * //    ProviderName,
 * //    ProviderSite,
 * //    ServiceContact: [ IndividualName ]
 * //  ]
 * //}
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
 * OperationsMetadata JSON scheme
 *
 * @param {string} uri URI of Service Provider
 * @returns {OperationsMetadata}
 * @examples
 * OperationsMetadata()
 * //{
 * //  OperationsMetadata: [
 * //    GetCapabilities,
 * //    GetTitle,
 * //    GetFeatureInfo
 * //  ]
 * //}
 */
function OperationsMetadata (uri = URI ) {
  // Capabilities.OperationsMetadata.GetCapabilities.DCP.HTTP
  const Get = {
    type: 'element',
    name: 'ows:ServiceProvider',
    attributes: {
      'xlink:href': `${ uri }?`,
    },
    elements: [Constraint],
  }

  // Capabilities.OperationsMetadata.GetCapabilities.DCP.HTTP
  const HTTP = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [Get],
  }

  // Capabilities.OperationsMetadata.GetCapabilities.DCP
  const DCP = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [HTTP],
  }

  // Capabilities.OperationsMetadata.GetCapabilities
  const GetCapabilities = {
    type: 'element',
    name: 'ows:ServiceProvider',
    elements: [DCP],
  }

  // Capabilities.OperationsMetadata
  const OperationsMetadata = {
    type: 'element',
    name: 'ows:OperationsMetadata',
    elements: [GetCapabilities, GetTile, GetFeatureInfo],
  }
  return OperationsMetadata
}


// <ows:OperationsMetadata>
//   <ows:Operation name="GetCapabilities">
//     <ows:DCP>
//       <ows:HTTP>
//         <ows:Get xlink:href="http://204.62.18.179:8080/geoserver/gwc/service/wmts?">
//           <ows:Constraint name="GetEncoding">
//             <ows:AllowedValues>
//               <ows:Value>KVP</ows:Value>
//             </ows:AllowedValues>
//           </ows:Constraint>
//         </ows:Get>
//       </ows:HTTP>
//     </ows:DCP>
//   </ows:Operation>

/**
 * Capabilities JSON scheme
 *
 * @returns {Capabilities}
 * @examples
 * Capabilities()
 * //{
 * //  Capabilities: [
 * //    ServiceIdentification,
 * //    ServiceProvider,
 * //    OperationsMetadata
 * //  ]
 * //}
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
