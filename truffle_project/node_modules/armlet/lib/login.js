const request = require('request')
const util = require('./util')

const basePath = 'v1/auth/login'

exports.do = (ethAddress, password, apiUrl) => {
  return new Promise((resolve, reject) => {
    const options = { form: { ethAddress, password } }
    const url = util.joinUrl(apiUrl.href, basePath)

    request.post(url, options, (error, res, body) => {
      if (error) {
        reject(error)
        return
      }

      // Handle redirect
      if (res.statusCode === 308 && apiUrl.protocol === 'http:') {
        apiUrl.protocol = 'https:'
        this.do(ethAddress, password, apiUrl).then(result => {
          resolve(result)
        }).catch(error => {
          reject(error)
        })
        return
      }

      /* eslint-disable prefer-promise-reject-errors */
      if (res.statusCode !== 200) {
        try {
          body = JSON.parse(body)
          reject(`Parse error of JWT login request: ${body.error} (HTTP status ${res.statusCode})`)
        } catch (err) {
          reject(`JSON result parse error for JWT login; body: ${err} (HTTP status ${res.statusCode})`)
        }
        return
      }

      try {
        body = JSON.parse(body)
      } catch (err) {
        reject(`JSON result parse error for JWT login; error: ${err}`)
        return
      }

      if (!body.refresh) {
        reject(`JWT login refresh token not received.`)
      }

      if (!body.access) {
        reject(`JWT login access token not received.`)
      }
      /* eslint-enable prefer-promise-reject-errors */

      resolve(body)
    })
  })
}
