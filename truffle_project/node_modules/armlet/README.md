[![CircleCI](https://circleci.com/gh/ConsenSys/armlet.svg?style=svg)](https://circleci.com/gh/ConsenSys/armlet)
[![Coverage Status](https://coveralls.io/repos/github/ConsenSys/armlet/badge.svg?branch=master)](https://coveralls.io/github/ConsenSys/armlet?branch=master)

# Armlet, a MythX API client wrapper

Armlet is a thin wrapper around the [MythX API](https://api.mythx.io/v1/openapi) written in Javascript. It simplifies interaction with [MythX](https://mythx.io/) and [JWT authentication](https://jwt.io/introduction/). For example, the library wraps API analysis requests into a promise, merges status information with analysis-result information, and judiciously polls for results.

A simple command-line tool, `mythx-analysis`, is provided to show how to use the API. It can be used to run MythX analyses on a single Solidity smart-contract text file.

# Installation

To install the latest stable version from NPM:

```
$ npm -g install armlet
```

If you're feeling adventurous, you can also install the from the master branch:

```
$ npm install -g git+https://git@github.com/ConsenSys/armlet.git
```

The `-g` or `--global` option above may not be needed depending on how you work. It may ensure `mythx-analysis` is in your path where it might not otherwise be there.

# Example

Here is a small example of how you might use this client. For demonstration purposes, we’ll set the credentials created on the MythX, you can use either the Ethereum address or email used during
[registration](https://docs.mythx.io/en/latest/main/getting-started.html#how-do-i-sign-up) and the password you created:


```console
$ export MYTHX_PASSWORD='AAAyyyyyyyy@*#!?'
$ export MYTHX_ETH_ADDRESS=0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef
```

Then get the MythX analysis results with the promise returned by
the exposed function:

```javascript
const armlet = require('armlet')
const client = new armlet.Client(
  {
      password: process.env.MYTHX_PASSWORD,
      ethAddress: process.env.MYTHX_ETH_ADDRESS,
  })

const data = {
    "bytecode": "0x608060405234801561001057600080fd5b5060d48061001f6000396000f3fe608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806338d94193146044575b600080fd5b348015604f57600080fd5b50607960048036036020811015606457600080fd5b8101908080359060200190929190505050608f565b6040518082815260200191505060405180910390f35b600081600881101515609d57fe5b01600091509050548156fea165627a7a723058206f554b09240c9771a583534d72575fcfb4623ab4df3ddc139442047795fd383b0029",
};

client.analyzeWithStatus(
    { "data": data }, // required
    3 * 60 * 1000 // timeout - optional
  ).then(result => {
	  const util = require('util');
	  console.log(`${util.inspect(result.status, {depth: null})}`);
	  console.log(`${util.inspect(result.issues, {depth: null})}`);
  }).catch(err => {
    console.log(err)
  })
```

For statistical tracking you can tag the type of tool making the request using `clientToolName`.
For example, to log analysis request as a use of `armlet-readme`, run:

```javascript
client.analyzeWithStatus(
    {
	"data": data,
	"clientToolName": "armlet-readme"
    })
  .then(result => {
    console.log(result.status, {depth: null})
    console.log(result.issues, {depth: null})
  }).catch(err => {
    console.log(err)
  })
```

# Improving Polling Response

There are two time parameters, given in milliseconds, that change how quickly a analysis result is reported back:

* initial delay
* maximum delay

The initial delay is the minimum amount of time that this library
waits before attempting its first status poll. Note however that if a
request has been cached, then results come back immediately and no
status polling is needed.  (The server caches previous analysis runs;
it takes into account the data passed to it, the analysis mode, and the
back-end versions of components used to provide the analysis.)

The maximum delay is the maximum amount of time we will wait for an
analysis to complete. Note, however, that if the processing has not
finished when this timeout is reached, it may still be running on the
server side. Therefore when a timeout occurs, you will get back a
UUID which can subsequently be used to get status and results.

The closer these two parameters are to the actual time range that is
needed by analysis, the faster the response will get reported back
after completion on the server end.

Good guessing of these two parameters reduces the
unnecessary probe time while providing good response around the declared
time interval.

So, how can you guess decent values? We have reasonable defaults built
in. But there are two factors that you can use to get better estimates.

The first is the kind of analysis mode used: a "quick" analysis will
usually be under two minutes, while a "full" analysis will usually be
under two hours.

When an analysis request finishes, we provide the amount of time used
broken into two components: the amount of time spent in analysis, and
the amount of time spent in queuing. The queuing time can vary
depending on what else is going on when the analysis request
was sent, so that's why it is separated out. In addition, the
library provides its own elapsed time in the response.

If you are making an analysis within an IDE which saves reports of
past runs, such as truffle or VSCode, the timings can be used for
estimates.

Read more about this [Polling the API to Obtain Job Status](https://docs.mythx.io/en/latest/main/building-security-tools-on-mythx.html?polling-the-api-to-obtain-job-status) in the [MythX API Developer Guide](https://docs.mythx.io/en/latest/main/building-security-tools-on-mythx.html).


# Clients using armlet

* [truffle-security](https://www.npmjs.com/package/truffle-security)
* [sabre](https://www.npmjs.com/package/sabre-mythx)
* [mythos](https://www.npmjs.com/package/mythos)

# See Also

* [example directory](https://github.com/ConsenSys/armlet/tree/master/example)
for some simple but runnable examples of how to use the client.
* [openapi spec](https://api.mythx.io/v1/openapi) for details of the MythX API.
* [MythX Developer and User Guide](https://docs.mythx.io) for more information
* [MythX Discord channel](https://discord.gg/kktn8Wt) to join the MythX community.
