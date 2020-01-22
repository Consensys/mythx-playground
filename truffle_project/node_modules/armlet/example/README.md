Here we have some command-line nodejs that can be run to show how to
use armlet and interact with the MythX API.

See the [openapi spec](https://api.mythx.io/v1/openapi) for details of the MythX API.

Input parameter handling is minimal and command options are lacking so
we can focus on how to set up and call the client.


* [mythx-analysis](https://github.com/ConsenSys/armlet/blob/master/example/mythx-analysis): Submit a JSON with Solidity source and EVM bytecode information to the MythX and retrieve results. For fancier clients see [mythos](https://github.com/cleanunicorn/mythos).
* [mythx-tool-use](https://github.com/ConsenSys/armlet/blob/master/example/mythx-tool-use): Show use counts for MythX tools.
* [mythx-api-version](https://github.com/ConsenSys/armlet/blob/master/example/api-version): Retrieve MythX API version information. JSON is output.
* [analysis-status](https://github.com/ConsenSys/armlet/blob/master/example/analysis-status): Get status of a prior MythX analysis request.
* [analysis-issues](https://github.com/ConsenSys/armlet/blob/master/example/analysis-issues): Get issues reported from a prior MythX analysis.
* [list-analyses](https://github.com/ConsenSys/armlet/blob/master/example/list-analyses): Get issues reported from a prior MythX analysis.
* [openapi-spec](https://github.com/ConsenSys/armlet/blob/master/example/openapi-spec): Retrieve the current MythX openapi specification. YAML is output.
See [folder `typescript`](https://github.com/ConsenSys/armlet/tree/master/example/typescript) for some of these examples written in [typescript](https://www.typescriptlang.org/).
