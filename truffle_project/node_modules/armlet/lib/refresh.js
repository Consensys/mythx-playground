/*
In the JWT login protocol a login gives back an access token and a refresh token.

The inital access token provides about 10 minutes of access.
When the initial 10-minute access runs out, the refresh token should be
submitted, to give another access token which lasts about a day.

This code is specifc to submitting the JWT refresh token.
*/

const request = require('request')
const util = require('./util')

const basePath = 'v1/auth/refresh'

exports.do = (accessToken, refreshToken, apiUrl) => {
  return new Promise((resolve, reject) => {
    const options = { form: { refreshToken, accessToken } }
    const url = util.joinUrl(apiUrl.href, basePath)

    request.post(url, options, (error, res, body) => {
      if (error) {
        reject(error)
        return
      }

      /* Note we return strings here. These often propogate directly to clients of this library.
         Error objects with tracebacks are not very useful here. */
      /* eslint-disable prefer-promise-reject-errors */
      if (res.statusCode !== 200) {
        reject(`Failed in submitting a JWT refresh request: ${res.statusMessage} (HTTP status code: ${res.statusCode})`)
        return
      }

      try {
        body = JSON.parse(body)
      } catch (err) {
        reject(`JSON parse error; JWT refresh body: ${err}`)
        return
      }

      if (!body.refresh) {
        reject(`JWT refresh token not received in refresh request.`)
      }

      if (!body.access) {
        reject(`JWT access token not received in refresh request.`)
      }
      /* eslint-disable prefer-promise-reject-errors */

      resolve(body)
    })
  })
}
