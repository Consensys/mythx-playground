const request = require('request')
const util = require('./util')
const basePath = 'v1/analyses'

// Note: this has been heavily customized for the MythX and
// running some sort of "analyze" function
exports.do = (input, accessToken, apiUrl) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: util.joinUrl(apiUrl.href, basePath),
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      json: input
    }

    request(options, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }

      /* eslint-disable prefer-promise-reject-errors */
      if (res.statusCode < 200 || res.statusCode > 299) {
        const errMsg = `Failed in retrieving analysis response: ${res.statusMessage} (HTTP status code: ${res.statusCode})`
        // console.log(errMsg)
        if (res.statusCode === 401) {
          /* For now, try to provide better 401 error messages. Right now, all we are ever getting
             back seems to be "Unauthorized". But Remi reports that somewhere in the back end
             the other two are set, even if right now they don't get passed through.
           */
          switch (res.statusMessage) {
            case 'Unauthorized':
              res.statusMessage = 'MythX credentials are incorrect.'
              break
            case 'Challenge expired':
              res.statusMessage = 'The token for the initial JWT login has expired; use the refresh token to get a longer-expiring access token.'
              break
            case 'Invalid challenge':
              res.statusMessage = 'MythX credentials are incorrect.'
              break
            default:
            // The hope is that if the message is not one of the above -- and that will happen sometime in the future --
            // then we have something useful that can be passed back untouched.
              break
          }

          // Compatibility with omni-fetch which is used in analysisPoller.
          res.status = res.statusCode
          reject(res)
          return
        } else if (res.statusCode === 400) {
          reject(res.body.error)
          return
        } else if (res.statusCode === 413) {
          reject('The JSON data for the Smart Contract(s) sent are too large to process.\nTry submitting fewer Smart Contracts or submit smaller pieces for analysis.')
          return
        } else if (res.statusCode === 502) {
          switch (res.statusMessage) {
            case 'Bad Gateway':
              reject('Server temporarily overloaded and cannot process your request; please try again later.')
              break
            default:
            // The hope is that if the message is not one of the above -- and that will happen sometime in the future --
            // then we have something useful that can be passed back untouched.
              reject(res.statusMessage)
          }
        }

        if (!data || !data.details) {
          reject(errMsg)
          return
        }
        const msgs = data.details.reduce((acc, detail) => {
          acc.push(detail.message)
          return acc
        }, [])
        reject(`${errMsg}: ${msgs.join(', ')}`)
        return
      }
      if (typeof data !== 'object') {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Non JSON data returned: ${data}`)
      }
      /* eslint-enable prefer-promise-reject-errors */

      resolve(data)
    })
  })
}
