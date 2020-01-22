var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

const nock = require('nock')
const sinon = require('sinon')
require('chai')
  .use(require('chai-as-promised'))
  .should()

const poller = require('../../lib/analysisPoller')
const util = require('../../lib/util')

describe('analysisPoller', () => {
  describe('#do', () => {
    const apiUrl = new URL('https://api.mythx.io')
    const validApiKey = 'valid-api-key'
    const uuid = 'my-uuid'
    const statusUrl = `/v1/analyses/${uuid}`
    const issuesUrl = `/v1/analyses/${uuid}/issues`
    const expectedIssues = [
      {
        title: 'Unchecked SUICIDE',
        description: 'The function `_function_0xcbf0b0c0` executes the SUICIDE instruction. The remaining Ether is sent to an address provided as a function argument.\n\nIt seems that this function can be called without restrictions.',
        function: '_function_0xcbf0b0c0',
        type: 'Warning',
        address: 156,
        debug: 'SOLVER OUTPUT:\ncalldata_MAIN_0: 0xcbf0b0c000000000000000000000000000000000000000000000000000000000\ncalldatasize_MAIN: 0x4\ncallvalue: 0x0\n'
      }
    ]

    const client = {
      accessToken: validApiKey,
      refreshToken: 'refreshToken',
      apiUrl: apiUrl
    }

    afterEach(() => {
      util.timer.restore()
    })

    beforeEach(() => {
      sinon.stub(util, 'timer')
    })

    it('should poll issues with empty results', async () => {
      const emptyResult = []
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, emptyResult)

      await poller.do(uuid, client, 10000, 5000).should.eventually.deep.equal(emptyResult)
    })

    it('should poll issues with non-empty results', async () => {
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, expectedIssues)

      await poller.do(uuid, client, 10000, 5000).should.eventually.deep.equal(expectedIssues)
    })

    it('should be able to query http API', async () => {
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, expectedIssues)

      await poller.do(uuid, client, 10000, 5000).should.eventually.deep.equal(expectedIssues)
    })

    it('should reject on server error', async () => {
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(500)

      await poller.do(uuid, client, 10000, 5000).should.be.rejected
    })

    it('should reject on non-JSON data', async () => {
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, 'non-json-data')

      await poller.do(uuid, client, 10000, 5000).should.be.rejected
    })

    it('should reject after a timeout', async () => {
      const timeout = 15
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .delay(timeout + 10)
        .reply(200, {
          status: 'In progress'
        })

      await poller.do(uuid, client, timeout, 5000).should.be.rejected
    })

    it('should wait for initialDelay', async () => {
      const emptyResult = []

      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, emptyResult)

      const initialDelay = 5000
      await poller.do(uuid, client, 10000, 5000).should.eventually.deep.equal(emptyResult)
      const delay = util.timer.getCall(0).args[0]
      delay.should.be.equal(initialDelay)
    })

    it('should wait for polling longer each time', async () => {
      const emptyResult = []

      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(3)
        .reply(200, {
          status: 'In progress'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .reply(200, {
          status: 'Finished'
        })
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(issuesUrl)
        .reply(200, emptyResult)

      let lastDelay = 0
      await poller.do(uuid, client, 10000, 5000).should.eventually.deep.equal(emptyResult)
      for (const i of [1, 2, 3]) {
        const nextDelay = util.timer.getCall(i).args[0]
        nextDelay.should.be.above(lastDelay)
        lastDelay = nextDelay
      }
    })

    it('should reject after maximum polling reached', async () => {
      nock(apiUrl.href, {
        reqheaders: {
          authorization: `Bearer ${validApiKey}`
        }
      })
        .get(statusUrl)
        .times(11)
        .reply(200, {
          status: 'In progress'
        })
      // FIXME: validApiKey shodl be an armlet client
      await poller.do(uuid, validApiKey).should.be.rejected
    })
  })
})
