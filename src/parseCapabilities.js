const fs = require('fs')
const path = require('path')
const convert = require('xml-js')
const utils = require('./utils')
const clean = utils.clean

/**
 * Parse Capabilities
 *
 * @param {string} xml
 * @returns {Object} WMTS Metadata
 */
function parseCapabilities(xml) {
  const results = JSON.parse(convert.xml2json(xml, {compact: true}))

  const Capabilities = results.Capabilities
  const ServiceIdentification = Capabilities['ows:ServiceIdentification']
  const OperationsMetadata = Capabilities['ows:OperationsMetadata']
  const Contents = Capabilities.Contents
  const ServiceMetadataURL = Capabilities.ServiceMetadataURL

  // ServiceIdentification
  const title = ServiceIdentification['ows:Title']['_text']
  const serviceType = ServiceIdentification['ows:ServiceType']['_text']
  const serviceTypeVersion = ServiceIdentification['ows:ServiceTypeVersion']['_text']

  // Contents
  const Layer = Contents.Layer
  const layerTitle = (Layer['ows:Title']) ? Layer['ows:Title']['_text'] : undefined
  const identifier = (Layer['ows:Identifier']) ? Layer['ows:Identifier']['_text'] : undefined
  const abstract = (Layer['ows:Abstract']) ? Layer['ows:Abstract']['_text'] : undefined
  const boundsWGS84 = Layer['ows:WGS84BoundingBox']

  const ResourceURL = Layer.ResourceURL
  const format = ResourceURL['_attributes'].format.replace(/image\//, '')
  const resourceType = ResourceURL['_attributes'].resourceType
  const url = ResourceURL['_attributes'].template

  // console.log(JSON.stringify(Contents, null, 4))
  return clean({
    url: url,
    title: title,
    format: format,
    abstract: abstract,
    identifier: identifier
  })
}

module.exports = parseCapabilities
