var URL
URL = (typeof window !== 'undefined' && window.URL)
  ? window.URL : require('url').URL

const requester = require('./lib/requester')
const simpleRequester = require('./lib/simpleRequester')
const analysisPoller = require('./lib/analysisPoller')
const login = require('./lib/login')
const refresh = require('./lib/refresh')
const libUtil = require('./lib/util')

const defaultApiUrl = process.env['MYTHX_API_URL'] || 'https://api.mythx.io'
const defaultApiVersion = 'v1'

// No MythX job we've seen is faster than this value.  So if an
// analysis request isn't cached, then the *first* poll for status
// will be delayed by this amount of time.
const defaultInitialDelay = 45000 // 45 seconds

class Client {
  /**
   *  Creates a client object. Internally this has login information, and from that
   *  an access token. By saving state, we can use and refresh the access token
   *  periodically.
   *
   *  @param {auth} object         - login or authentication information which contains
   *                                 an ethAddress and a password
   *  @param {inputApiUrl} string  - Optional. A URL of a MythX API server we want to contect
   *                                 to.
   *
   */
  constructor (auth, inputApiUrl = defaultApiUrl) {
    const { ethAddress, password } = auth || {}

    if (!password || !ethAddress) {
      throw 'Please provide an Ethereum address and a password.'
    }

    const apiUrl = new URL(inputApiUrl)
    if (!apiUrl.hostname) {
      throw new TypeError(`${inputApiUrl} is not a valid URL`)
    }

    this.ethAddress = ethAddress
    this.password = password
    this.apiUrl = apiUrl
  }

  /**
    * Runs MythX analysis.
    * Deprecated. See analyzeWithStatus() instead.
    *
    * @param {options} object      - structure which must contain
    *      {data} object           - information containing Smart Contract information to be analyzed
    *      {timeout} number        - optional timeout value in milliseconds
    *      {clientToolName} string - optional; sets up for client tool usage tracking
    *      {initialDelay} number   - optional; After submitting an analysis and seeing that it is
    *                                not cached, the first status API call will be delayed by this
    *                                number of milliseconds
    *
    * The minimum value for how long a non-cached analyses will take
    * must be larger than defaultInitialDelay which we believe to be
    * the smallest reasonable value.
    *
    * @returns an array-like object of issues, and a uuid attribute which can
    *          be subsequently used to retrieve the information from our stored
    *          database using getIssues().
    *
    **/
  async analyze (options, timeout, initialDelay, debug) {
    if (options === undefined || options.data === undefined) {
      // eslint-disable-next-line no-throw-literal
      throw 'Please provide analysis request JSON in a "data" attribute.'
    }

    await this.login()

    let requestResponse
    try {
      requestResponse = await requester.do(options, this.accessToken, this.apiUrl)
    } catch (e) {
      /*
        Normally requester passes back strings. However there is a spcial case for
        HTTP 401 JWT access token has expired and we need to refresh it.
      */
      if (e.statusCode !== 401) {
        throw e
      }
      const tokens = await refresh.do(this.accessToken, this.refreshToken, this.apiUrl)
      this.accessToken = tokens.access
      this.refreshToken = tokens.refresh

      requestResponse = await requester.do(options, this.accessToken, this.apiUrl)
    }

    /*
       Set "timeout" - the maximum amount of time we want to wait on
       a request before giving up.

       Unless a timeout has been explicitly given (and we recommend it should be),
       we will use a value of 5 minutes for a "quick" analysis and
       5 hours for a "full" analysis.

       Note:
         A "quick" analysis usually finishes within 90 seconds after the job starts.
         A "full" analysis may run for 2 hours or more.
         There is also average queuing delay as well which on average may be at
         least 5 seconds.
    */
    if (!timeout) {
      timeout = (60 * 1000) * (
        (options.data.analysisMode !== 'full')
          ? 5 // 5 minutes
          : (5 * 60) // 5 hours
      )
    }

    if (debug) {
      console.log(`now: ${Math.trunc(Date.now() / 1000)}`)
    }

    let result
    if (requestResponse.status === 'Finished') {
      result = await analysisPoller.getIssues(requestResponse.uuid, this)
      if (debug) {
        const util = require('util')
        let depth = (debug > 1) ? 10 : 2
        console.log(`Cached Result:\n${util.inspect(result, { depth: depth })}\n------`)
      }
    } else {
      initialDelay = Math.max(initialDelay || 0, defaultInitialDelay)
      try {
        result = await analysisPoller.do(requestResponse.uuid, this, timeout, initialDelay, debug)
      } catch (e) {
        /*
          Normally requester passes back strings. However there is a spcial case for
          HTTP 401 JWT access token has expired and we need to refresh it.
        */
        if (e.status !== 401) {
          throw e
        }
        const tokens = await refresh.do(this.accessToken, this.refreshToken, this.apiUrl)
        this.accessToken = tokens.access
        this.refreshToken = tokens.refresh
        result = await analysisPoller.do(requestResponse.uuid, this, timeout,
          initialDelay, debug)
      }
    }

    return {
      issues: result,
      uuid: requestResponse.uuid
    }
  }

  /**
    * Retrieves status records of past MythX analyses requests.
    *
    * @param {options} object - structure which must contain
    *      {data} object       - information containing Smart Contract information to be analyzed
    *      {timeout} number    - optional timeout value in milliseconds
    *
    * @returns an array-like object of issue status from our stored database.
    *
    **/
  async analyses (options) {
    if (options === undefined || options.dateFrom === undefined) {
      throw new TypeError('Please provide a dateFrom option.')
    }

    if (!this.accessToken) {
      const tokens = await login.do(this.ethAddress, this.password, this.apiUrl)
      this.accessToken = tokens.access
      this.refreshToken = tokens.refresh
    }
    const url = libUtil.joinUrl(this.apiUrl.href, `${defaultApiVersion}/analyses?dateFrom=${options.dateFrom}&dateTo=${options.dateTo}&offset=${options.offset}`)
    let analyses
    try {
      analyses = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
    } catch (e) {
      if (e.status !== 401) {
        throw e
      }
      const tokens = await refresh.do(this.accessToken, this.refreshToken, this.apiUrl)
      this.accessToken = tokens.access
      this.refreshToken = tokens.refresh

      analyses = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
    }
    return analyses
  }

  /**
    * Runs MythX analysis return issue information and metadata regarding the run
    *
    * @param {object} options - structure which must contain:
    *      {data} object       - information containing Smart Contract information to be analyzed
    *      {Number} timeout    - optional timeout value in milliseconds
    *      {String} clientToolName - optional; sets up for client tool usage tracking
    *
    * @returns object which contains:
    *      (Number}  elsped - elaped milliseconds that we recorded
    *      (Object}  issues - an like object which of issues is grouped by (file) input container.
    *      {Object} status - status information as returned in each object of analyses().
    *
    **/
  async analyzeWithStatus (options, timeout, initialDelay) {
    const start = Date.now()
    const { issues, uuid } = await this.analyze(options, timeout, initialDelay)
    const status = await this.getStatus(uuid)
    const elapsed = Date.now() - start
    return {
      elapsed,
      issues,
      status
    }
  }

  async getStatusOrIssues (uuid, url) {
    await this.login()

    let result
    try {
      result = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
    } catch (e) {
      if (e.status === 401) {
        const tokens = await refresh.do(this.accessToken, this.refreshToken, this.apiUrl)
        this.accessToken = tokens.access
        this.refreshToken = tokens.refresh
        result = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
      } else {
        let msg = `Failed in retrieving analysis response, HTTP status code: ${e.status}. UUID: ${uuid}`
        if (e.status === 404) {
          msg = `Analysis with UUID ${uuid} not found.`
        }
        throw msg
      }
    }
    return result
  }

  /**
   * Runs MythX JWT login. On succes sets:
   *    this.accessToken and this.refreshToken on successu
   * On failure we throw a a string error message.
   **/
  async login () {
    if (!this.accessToken) {
      let tokens
      try {
        tokens = await login.do(this.ethAddress, this.password, this.apiUrl)
      } catch (e) {
        // eslint-disable-next-line no-throw-literal
        throw (`MythX login for ethereum address  ${this.ethAddress} failed:\n${e}`)
      }
      this.accessToken = tokens.access
      this.refreshToken = tokens.refresh
    }
  }

  /**
    * Retrieves info about the current logged-in user
    *
    * @returns Object containing user info
    **/
  async getUserInfo () {
    await this.login()

    const url = libUtil.joinUrl(this.apiUrl.href, `${defaultApiVersion}/users`)
    let userInfo
    try {
      userInfo = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
    } catch (e) {
      if (e.status !== 401) {
        throw e
      }
      const tokens = await refresh.do(this.accessToken, this.refreshToken, this.apiUrl)
      this.accessToken = tokens.access
      this.refreshToken = tokens.refresh

      userInfo = await simpleRequester.do({ url, accessToken: this.accessToken, json: true })
    }
    return userInfo
  }

  async getStatus (uuid, inputApiUrl = defaultApiUrl) {
    const url = libUtil.joinUrl(this.apiUrl.href, `${defaultApiVersion}/analyses/${uuid}`)
    return this.getStatusOrIssues(uuid, url, inputApiUrl)
  }

  async getIssues (uuid, inputApiUrl = defaultApiUrl) {
    const url = libUtil.joinUrl(this.apiUrl.href, `${defaultApiVersion}/analyses/${uuid}/issues`)
    return this.getStatusOrIssues(uuid, url, inputApiUrl)
  }

  async listAnalyses (inputApiUrl = defaultApiUrl) {
    let accessToken = this.accessToken
    if (!accessToken) {
      const tokens = await login.do(this.ethAddress, this.password, this.apiUrl)
      accessToken = tokens.access
    }
    const url = libUtil.joinUrl(inputApiUrl, `${defaultApiVersion}/analyses`)
    return simpleRequester.do({ url,
      accessToken: accessToken,
      json: true,
      ethAddress: this.ethAddress })
  }
}

/*
  Return a promise of MythX API information. For example,
  after the promise is resolved we get:

{
  api: 'v1.4.3-45-g3a7a71f',
  harvey: '0.0.13',
  maestro: '1.2.3-2-g2d54a08',
  maru: '0.4.1',
  mythril: '0.20.0',
  hash: 'd40ef2cdd30ccf134c0ae0fe2e90b247'
  url: 'https://api.mythx.io'
}
*/
module.exports.ApiVersion = (inputApiUrl = defaultApiUrl) => {
  const url = libUtil.joinUrl(inputApiUrl, `${defaultApiVersion}/version`)
  return simpleRequester.do({ url, json: true }).then(result => {
    result.url = inputApiUrl
    return result
  })
}

// Return a promise for the MythX openAPI spec in YAML format.
module.exports.OpenApiSpec = (inputApiUrl = defaultApiUrl) => {
  const url = libUtil.joinUrl(inputApiUrl, `${defaultApiVersion}/openapi.yaml`)
  return simpleRequester.do({ url })
}

// Return an array of promises for the MythX tool use counts
// The actual result is an object.
module.exports.mythXToolUse = (toolNames, inputApiUrl = defaultApiUrl) => {
  let promises = []
  for (const toolName of toolNames) {
    const url = libUtil.joinUrl(inputApiUrl, `${defaultApiVersion}/client-tool-stats/${toolName}`)
    promises.push(simpleRequester.do({ url }).then(result => {
      const jsonObj = JSON.parse(result)
      jsonObj.name = toolName
      return jsonObj
    }))
  }
  return promises
}

module.exports.Client = Client
module.exports.defaultApiUrl = new URL(defaultApiUrl)
module.exports.defaultApiHost = defaultApiUrl
module.exports.defaultApiVersion = defaultApiVersion
module.exports.defaultInitialDelay = defaultInitialDelay
