Release 2.7.0
================

The parameters `timeout`, `initalDelay`, and `debug` are no longer set in the `options` parameter for `Client.analyze`. These are all now seperate (optional) arguments.
```
Client.analyze(options, timeout, initialDelay, debug)
```

Fixed a bug preventing token refresh when using the same Client for more than 10 minutes.

Documentation updates 

Release 2.6.0
================

Implemented a fix to prevent sending bad data to the API.

Release 2.5.2
================

Add another fix for `URL` so that it works correctly in a web browser.

Release 2.5.1
================

Fix handling of `URL` to enable correct functionality in a web browser.

Release 2.5.0
================

Add the `getUserInfo` method to retrieve information about the logged-in user.

Release 2.4.0
================

Fix bugs with undefined data in requester.js.

Fix a bug involving not setting the login access token.

Fix a bug with `simpleRequester` error handling.

Much of this work was kindly contributed by Teruhiro Tagomori at [NRI Secure Technologies](https://www.nri-secure.com/security-consulting/blockchain-assessment).


Release 2.3.0
================

Correct polling time in time-out consideration.
This work was kindly contributed by Teruhiro Tagomori at [NRI Secure Technologies](https://www.nri-secure.com/security-consulting/blockchain-assessment).

Added `armlet.mythXToolUse(toolNames, [inputApiUrl])` to report use counts for various MythX tools that run analysis. See example program `mythx-api-version` for how to use.

Update extend, and install some example programs:

* mythx-tool-use: gets counts on how many times a MythX tool was used. This is installed now.
* mythx-api-version: "mythx" prefix added. This is installed now, where previously it was not.

Release 2.2.0
================

Fixed refreshing the JWT access token inside an analysis request. It was apparently incorrect since the beginning.

Fixed the handling of the initialDelay parameter.
This work was kindly contributed by Teruhiro Tagomori at [NRI Secure Technologies](https://www.nri-secure.com/security-consulting/blockchain-assessment).

Improved error messages from the MythX yet again, specifcally where the access token was not refreshed,
and also authentication errors.

In more cases we return a string on MythX HTTP errors rather than more complex objects with useless tracebacks.

Release 2.1.0
================

Added login instance method to Client object
------------------------------------------------------
Added a new method login which can reduce the number of API login requests that are needed.

For a client like `truffle-security` which can perform analysis
of the contracts in a truffle project, rather than issue a login request for each contract, only a single
login is required.

This work was kindly contributed by Teruhiro Tagomori at [NRI Secure Technologies](https://www.nri-secure.com/security-consulting/blockchain-assessment).

Improved Error Messaging
-----------------------------

Error-message text `Bad Gateway` should no longer appear.  A more meaningful description is given.

Fixed some bugs.


mythx-analysis
------------------

Added a `--yaml` option to show the results in YAML format rather than JSON.

Information sent to MythX for contracts that use "imports" should contain more information inside the AST, since MythX will soon be able to use it.

Miscellaneous
----------------

Fixed armlet handling of the JWT's token refresh.

Release 2.0.1
=================

Overall, slight improvements have been made.

Polling Performance values have been tweaked to give better performance
-----------------------------------------------------------------------------------------

The recommended default initial delay is now 45 seconds, while the quick-mode time out value is now
5 minutes.

Error messaging has been improved
-----------------------------------------

- distracting and not-helpful tracebacks have been removed
- the UUID is given on those error messages where it can be useful


mythx-analysis
-----------------

The standalone CLI program to run MythX Solidity or solc JSON output has a new option `--no-cache-lookup` disables cache lookup on the MythX side. Normally this isn't desired, but if you need to force a new analysis, this is one way to do it.


Miscelleaneous
------------------

Documentation has been updated and improved.

Release 2.0.0
=================

A lot has changed in the almost two weeks that have elapsed since the last release.

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Changes for Mythx API 1.4](#changes-for-mythx-api-14)
- [Geometrically-increasing delays in polling](#geometrically-increasing-delays-in-polling)
- [Introducing command-line utility "mythx-analysis"](#introducing-command-line-utility-mythx-analysis)
- [Library changes not mentioned above](#library-changes-not-mentioned-above)

<!-- markdown-toc end -->

Changes for MythX API 1.4
-------------------------------

Perhaps the biggest change is that we now support version [MythX API v1.4](https://docs.mythx.io/en/latest/main/release-notes.htm). This means various authentication options involving an API key or an email address are no longer supported.

There were some smaller changes in the back end; the acceptable way to interact with the back-end protocol has been adjusted.


Geometrically-increasing delays in polling
-----------------------------------------------------

We noticed that there was a lot of overhead created on the back end caused by polling for analysis status. Taking a cue from how the Ethernet handles congestion, successive polls are now spaced more widely.

For applications which use MythX through armlet, when they can predict the likely time interval for the contract submitted, they will be rewarded with a reduced delay in noticing that results are ready on the back-end.

Parameter `initial-delay` was added. This is the minimum amount of time that this library waits before attempting its first status poll when the results are not already cached.

You can read about improving polling response [here](https://github.com/ConsenSys/armlet/#improving-polling-response).


Introducing command-line utility "mythx-analysis"
-------------------------------------------------------------

The "example" program `analysis` is now called `mythx-analysis` and it is installed as a standalone command-line utility.

It is more full featured:

   * it supports more armlet library options,
     `--version`, `--timeout`, `--delay`, and `--debug`
   * it can accept Solidity source code and will run `solc` to compile the source before passing
     on to MythX

Sample Solidity contracts now appear in [`example/solidity-files`](https://github.com/ConsenSys/armlet/tree/master/example/solidity-files)


Library changes not mentioned above
--------------------------------------------

An additional analysis option `debug` is available. With this, you can get more information about what is going on in armlet. Setting `debug` to a numeric value of 2 or more gives more-verbose output.


Getting a list of past analyses is not allowed as a trial user, as is now noted in the response. We suggest a suitable course of action (registering) and supply a link to do so.

Some small URL canonicalization is now done. In particular you can add a trailing slash to the HTTP host `https://api.mythx.io/` and that is the same things as `https://api.mythx.io`.

Similarly `http` will be turned into `https` when appropriate.

There is now proxy support via [`omni-fetch`](https://www.npmjs.com/package/omni-fetch) which is a wrapper to
[`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch). This work was kindly contributed by Teruhiro Tagomori at [NRI Secure Technologies](https://www.nri-secure.com/security-consulting/blockchain-assessment).

Additional tests were added and test-code coverage has been increased. This is the work of Daniyar Chambylov at Mad Devs.

Some time units are shown in a more human-friendly way. There are numerous other small documentation and code improvements.

Older Releases
=================

v1.2.1 - 2019-02-06
-----------------------

- Better MythX API error reporting, esp HTTP 400, 401, 502, 504
- example analysis mode is "quick"

v1.2.0 - 2019-02-03
-----------------------

- tool status tracking via clientToolName
- Simplify example in README
- Adjust to accomodate looser required data fields
- If no registration set, run as a trial user
- More useful messages around common situations with remedial suggestions:
  * timeout
  * authentication problems
  * UUID not found
  * Sending JSON data which is too large
- Add interfaces to list previous analyses results and the status of each
- Add corresponding example programs for the above
- Numerous doc tweaks and code tweaks
