import * as chalk from 'chalk'

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
 * Clean remove undefined attributes from object
 *
 * @param {Object} obj
 */
export function clean(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Pretty Error message
 */
export function error(...message: any[]) {
  console.log(chalk.bgRed.white('[Error]' + message.join(' ')))
  throw new Error(message.join(' '))
}

/**
 * Normalize URL
 *
 * @param {string} url
 * @returns {string} Normalized URL
 */
export function normalize(url: string) {
  return url && url.replace(/$\//, '')
}
