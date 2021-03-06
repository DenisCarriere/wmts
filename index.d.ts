export type BBox = [number, number, number, number] // [west, south, east, north]
export type Format = 'png' | 'jpeg' | 'jpg'
export interface Options extends ServiceIdentification, Layer { spaces?: number }
export interface Metadata extends ServiceIdentification, Layer {}
export interface Layer {
  title: string
  url: string
  format: Format
  abstract?: string
  identifier?: string
  bbox?: BBox
  minzoom?: number
  maxzoom?: number
}
export interface ServiceIdentification {
  title: string
  abstract?: string
  keywords?: string[]
  accessConstraints?: string
  fees?: string
}
export function getCapabilities (options: Options): string
export function parseCapabilities (xml: string): Metadata