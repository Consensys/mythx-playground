var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

const nock = require('nock')
require('chai')
  .use(require('chai-as-promised'))
  .should()

const requester = require('../../lib/requester')

describe('requester', () => {
  describe('#do', () => {
    const defaultApiUrl = new URL('https://api.mythx.io')
    const httpApiUrl = new URL('http://localhost:3100')
    const httpsApiUrl = new URL('https://localhost:3100')

    const validApiKey = 'valid-api-key'
    const uuid = 'my-uuid'
    const basePath = '/v1/analyses'
    const data = { bytecode: '00' }

    it('should request analysis for http API', async () => {
      nock(httpApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(200, {
          result: 'Queued',
          uuid: uuid
        })

      await requester.do(data, validApiKey, httpApiUrl).should.eventually.deep.equal({
        result: 'Queued',
        uuid
      })
    })

    it('should request analysis for https API', async () => {
      nock(httpsApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(200, {
          result: 'Queued',
          uuid: uuid
        })

      await requester.do(data, validApiKey, httpsApiUrl).should.eventually.deep.equal({
        result: 'Queued',
        uuid
      })
    })

    it('should default to official API endpoint', async () => {
      nock(defaultApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(200, {
          result: 'Queued',
          uuid: uuid
        })

      await requester.do(data, validApiKey, defaultApiUrl).should.eventually.deep.equal({
        result: 'Queued',
        uuid
      })
    })

    it('should reject on api server connection failure', async () => {
      const invalidApiHostname = new URL('http://not-a-valid-hostname')

      await requester.do(data, validApiKey, invalidApiHostname).should.be.rejectedWith(Error)
    })

    // it('should reject on api server 401', async () => {
    //   nock(httpApiUrl.href, {
    //     reqheaders: {
    //       authorization: `Bearer ${validApiKey}`
    //     }
    //   })
    //     .post(basePath, data)
    //     .reply(401)

    //   await requester.do(data, validApiKey, httpApiUrl).should.be.rejectedWith('MythX credentials are incorrect.')
    // })

    it('should reject on api server 500', async () => {
      nock(httpApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(500, { error: 'Something went wrong in the server' })

      await requester.do(data, validApiKey, httpApiUrl).should.be
        .rejected
    })

    it('should reject on request limit errors', async () => {
      const expectedErrorMsg = 'request limit exceeded'
      nock(httpApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(429, {
          error: expectedErrorMsg
        })

      await requester.do(data, validApiKey, httpApiUrl).should.be
        .rejected
    })

    it('should reject on validation errors', async () => {
      const expectedErrorMsg1 = 'Failed to get response, status code 400: field x required'
      nock(httpApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(400, expectedErrorMsg1)

      await requester.do(
        data,
        validApiKey,
        httpApiUrl).should.be.rejected
    })

    // it('should reject on authentication errors', async () => {
    //   const inValidApiKey = 'my-invalid-api--key-sigh'

    //   nock(httpApiUrl.href, {
    //     reqheaders: {
    //       authorization: `Bearer ${inValidApiKey}`
    //     }
    //   })
    //     .post(basePath, data)
    //     .reply(401, 'Unauthorized')

    //   await requester.do(data, inValidApiKey, httpApiUrl).should.be.rejectedWith('MythX credentials are incorrect.')
    // })

    it('should reject on non-JSON data', async () => {
      nock(defaultApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(200, 'non-json-response')

      await requester.do(data, validApiKey, defaultApiUrl).should.be.rejectedWith('Non JSON data returned: non-json-response')
    })

    it('should reject on Smart Contract input JSON too large', async () => {
      const mess = 'The JSON data for the Smart Contract(s) sent are too large to process.\nTry submitting fewer Smart Contracts or submit smaller pieces for analysis.'
      nock(defaultApiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .post(basePath, data)
        .reply(413)

      await requester.do(data, validApiKey, defaultApiUrl).should.be.rejectedWith(mess)
    })
  })
})
