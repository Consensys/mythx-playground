var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

/**
 * Wait for the specified time.
 *
 * @param {Number} time Interval duration [ms].
 * @return {Promise} Resolves after the specified delay.
 */
exports.timer = async time =>
  new Promise(resolve => setTimeout(resolve, time))

exports.joinUrl = (base, path) => {
  const u = new URL(path, base)
  return u.href
}
