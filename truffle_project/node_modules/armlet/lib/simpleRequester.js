/*
   This is somewhat generic but specific to the MythX API and handles
   API requests which do not require more than a single request.

   This is in contrast, say, to analysis where a request, needs
   to be followed by polling.
*/

const request = require('request')
const HttpErrors = require('http-errors')
const trialEthAccount = '0x0000000000000000000000000000000000000000'

exports.do = options => {
  return new Promise((resolve, reject) => {
    const reqOptions = { url: options.url }
    if (options.accessToken) {
      reqOptions.headers = {
        'Authorization': `Bearer ${options.accessToken}`
      }
    }
    request(reqOptions, (error, res, body) => {
      if (error) {
        reject(error)
        return
      }
      if (res.statusCode === 401) {
        const prefix = 'HTTP status 401: '
        try {
          body = JSON.parse(body)
        } catch (err) {
          reject(new Error(`${prefix}${err}`))
          return
        }
        reject(HttpErrors(res.statusCode, body.error))
        return
      } else if ((res.statusCode === 403) &&
                  (res.request.uri.path.endsWith('/analyses')) &&
                  (options.ethAddress === trialEthAccount)) {
        // FIXME: Remove when API gives back a custom message like this:
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('The trial user does not allow listing previous analyses. To enable this feature, please sign up for a free account on: https://mythx.io')
      } else if (res.statusCode !== 200) {
        try {
          body = JSON.parse(body)
        } catch (err) {
          reject(new Error(`JSON parse error ${err}`))
          return
        }
        reject(HttpErrors(res.statusCode, 'Invalid status code, expected 200'))
        return
      }
      if (options.json) {
        try {
          body = JSON.parse(body)
        } catch (err) {
          reject(new Error(`JSON parse error ${err}`))
          return
        }
      }
      resolve(body)
    })
  })
}
