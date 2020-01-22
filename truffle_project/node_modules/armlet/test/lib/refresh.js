var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

const nock = require('nock')
require('chai')
  .use(require('chai-as-promised'))
  .should()

const refresh = require('../../lib/refresh')

describe('refresh', () => {
  describe('#do', () => {
    const apiUrl = 'https://localhost:3100'
    const parsedApiUrl = new URL(apiUrl)
    const refreshPath = '/v1/auth/refresh'
    const expiredRefreshToken = 'expiredRefresh'
    const expiredAccessToken = 'expiredAccess'
    const expiredJsonTokens = { refreshToken: expiredRefreshToken, accessToken: expiredAccessToken }
    const renewedJsonTokens = { refresh: 'renewedRefresh', access: 'renewedAccess' }

    it('should return renewed refresh and access tokens', async () => {
      nock(apiUrl)
        .post(refreshPath, expiredJsonTokens)
        .reply(200, renewedJsonTokens)

      await refresh.do(expiredAccessToken, expiredRefreshToken, parsedApiUrl).should.eventually.deep.equal(renewedJsonTokens)
    })

    it('should reject on api server connection failure', async () => {
      const invalidApiHostname = 'not-an-url-object'

      await refresh.do(expiredAccessToken, expiredRefreshToken, invalidApiHostname).should.be.rejectedWith(Error)
    })

    it('should reject on api server status code != 200', async () => {
      nock(apiUrl)
        .post(refreshPath, expiredJsonTokens)
        .reply(500)

      await refresh.do(expiredAccessToken, expiredRefreshToken, parsedApiUrl).should.be.rejected
    })

    it('should reject on non-JSON data', async () => {
      nock(apiUrl)
        .post(refreshPath, expiredJsonTokens)
        .reply(200, 'newjsonTextTokens')

      await refresh.do(expiredAccessToken, expiredRefreshToken, parsedApiUrl).should.be.rejected
    })

    it('should reject if refreshToken is not present in response', async () => {
      nock(apiUrl)
        .post(refreshPath, expiredJsonTokens)
        .reply(200, { access: 'access' })

      await refresh.do(expiredAccessToken, expiredRefreshToken, parsedApiUrl).should.be.rejected
    })

    it('should reject if accessToken is not present', async () => {
      nock(apiUrl)
        .post(refreshPath, expiredJsonTokens)
        .reply(200, { refresh: 'refresh' })

      await refresh.do(expiredAccessToken, expiredRefreshToken, parsedApiUrl).should.be.rejected
    })
  })
})
