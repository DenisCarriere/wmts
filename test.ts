import test from 'ava'
import * as wmts from './index'

const TITLE = 'Web Map Tile Service'
const NAME = 'WMTS Server'
const SCHEME = 'http'
const HOST = 'localhost'
const PORT = 80
const PATH = '/wmts'
const URI = `${ SCHEME }://${ HOST }:${ PORT }${ PATH }` // http://localhost:80/wmts

test('getCapabilities', t => {
  const capabilities = wmts.getCapabilities({
    uri: URI,
    title: TITLE,
  })
  t.true(!!capabilities)
})
