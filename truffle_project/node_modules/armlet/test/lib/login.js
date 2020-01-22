var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

const nock = require('nock')
require('chai')
  .use(require('chai-as-promised'))
  .should()

const login = require('../../lib/login')

describe('login', () => {
  describe('#do', () => {
    const apiUrl = 'https://localhost:3100'
    const parsedApiUrl = new URL(apiUrl)
    const ethAddress = '0x74B904af705Eb2D5a6CDc174c08147bED478a60d'
    const password = 'password'
    const auth = { ethAddress, password }
    const loginPath = '/v1/auth/login'
    const refresh = 'refresh-token'
    const access = 'access-token'
    const jsonTokens = { refresh, access }

    it('should return refresh and access tokens', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, jsonTokens)

      await login.do(ethAddress, password, parsedApiUrl).should.eventually.deep.equal(jsonTokens)
    })

    it('should redirect refresh and access tokens', async () => {
      nock('http://localhost:3100')
        .post(loginPath, auth)
        .reply(200, jsonTokens)

      const parsedApiUrlHttp = new URL('http://localhost:3100')
      await login.do(ethAddress, password, parsedApiUrlHttp)
        .should.eventually.deep.equal(jsonTokens)
    })

    it('should reject on api server connection failure', async () => {
      const invalidUrlObject = 'not-an-url-object'

      await login.do(ethAddress, password, invalidUrlObject).should.be.rejected
    })

    it('should reject on api server status code != 200', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(500)

      await login.do(ethAddress, password, parsedApiUrl).should.be.rejectedWith('HTTP status 500')
    })

    it('should reject on non-JSON data', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, 'jsonTextTokens')

      await login.do(ethAddress, password, parsedApiUrl).should.be.rejected
    })

    it('should reject if refreshToken is not present', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, { access })

      await login.do(ethAddress, password, parsedApiUrl).should.be.rejected
    })

    it('should reject if accessToken is not present', async () => {
      nock(apiUrl)
        .post(loginPath, auth)
        .reply(200, { refresh })

      await login.do(ethAddress, password, parsedApiUrl).should.be.rejected
    })
  })
})
