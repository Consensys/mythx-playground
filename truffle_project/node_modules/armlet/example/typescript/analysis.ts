#!/usr/bin/env node

"use strict";
import * as fs from 'fs';
import * as util from 'util';

function usage() {
    console.log(`usage: ${process.argv[1]} [*mythx-api-json-path*] [*timeout-secs*]

Run MythX analyses on *mythx-api-json-path*

Set environment MYTHX_PASSWORD and MYTHX_ETH_ADDRESS or before using.
`)
    process.exit(1);
}

require('../helper');

const argLen = process.argv.length
if (argLen === 3 &&
    process.argv[2].match(/^[-]{0,2}h(?:elp)?$/)) {
    usage();
}

let timeout = 20
if (argLen >= 3 &&
    process.argv[argLen-1].match(/^\d+$/)) {
    timeout = parseInt(process.argv[argLen-1]);
}


const jsonPath = process.argv[2] || `${__dirname}/../sample-json/PublicArray.json`;

/**********************************
  Example code starts here ...
***********************************/

// What we use in a new armlet analyze call
interface AnalyzeOptions {
    data: any;  // Actually a JSON dictionary
    timeout: number;
};

let armletOptions = {
    password:  process.env.MYTHX_PASSWORD,
    platforms: [],
}

if (process.env.MYTHX_ETH_ADDRESS) {
    armletOptions["ethAddress"] = process.env.MYTHX_ETH_ADDRESS
}

const armlet = require('../../index'); // if not installed
// import * as armlet from 'armlet' // if installed

const client = new armlet.Client(armletOptions)

const analyzeOptions = {
    data: JSON.parse(fs.readFileSync(jsonPath, 'utf8')),
    timeout: timeout * 1000  // convert secs to millisecs
}

client.analyze(analyzeOptions)
    .then(issues => {
        console.log(`${util.inspect(issues, {depth: null})}`)
    }).catch(err => {
        console.log(err)
    })
