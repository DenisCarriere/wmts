/**
 * Clean remove undefined attributes from object
 *
 * @private
 * @param {Object} obj JSON object
 * @returns {Object} clean JSON object
 * @example
 * clean({foo: undefined, bar: 123})
 * //={bar: 123}
 * clean({foo: 0, bar: 'a'})
 * //={foo: 0, bar: 'a'}
 */
function clean (obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Normalize URL
 *
 * @private
 * @param {string} url
 * @returns {string} Normalized URL
 * @example
 * normalize('http://localhost:5000')
 * //=http://localhost:5000/
 */
function normalize (url) {
  return url && url.replace(/$\//, '')
}

/**
 * Generate an integer Array containing an arithmetic progression.
 *
 * @private
 * @param {number} [start=0] Start
 * @param {number} stop Stop
 * @param {number} [step=1] Step
 * @returns {number[]} range
 * @example
 * mercator.range(3)
 * //=[ 0, 1, 2 ]
 * mercator.range(3, 6)
 * //=[ 3, 4, 5 ]
 * mercator.range(6, 3, -1)
 * //=[ 6, 5, 4 ]
 */
function range (start, stop, step) {
  if (stop == null) {
    stop = start
    start = 0
  }
  if (!step) {
    step = stop < start ? -1 : 1
  }
  var length = Math.max(Math.ceil((stop - start) / step), 0)
  var range = Array(length)
  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start
  }
  return range
}

module.exports = {
  clean: clean,
  normalize: normalize,
  range: range
}
