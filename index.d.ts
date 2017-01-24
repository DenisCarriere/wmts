export type BBox = [number, number, number, number] // [west, south, east, north]
export type Format = 'png' | 'jpeg' | 'jpg'

interface Options extends ServiceIdentificationOptions, LayerOptions {
  spaces?: number
  minzoom?: number
  maxzoom?: number
}

interface LayerOptions {
  title: string
  url: string
  format: Format
  abstract?: string
  identifier?: string
  bbox?: BBox
}

interface ServiceIdentificationOptions {
  title: string
  abstract?: string
  keywords?: string[]
  accessConstraints?: string
  fees?: string
}

export function getCapabilities (options: Options): string