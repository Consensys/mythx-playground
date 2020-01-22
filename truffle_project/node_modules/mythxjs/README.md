# MythX JS Library

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

MythXJS is a Javascript based library for the [Mythx](https://mythx.io/) smart contract security analysis platform.

The library works out of the box on Node and modern browsers.

## Installation

```
npm install mythxjs
```

## Example

Creating a new instance of the library using ES6 modules

```typescript
import { Client } from 'mythxjs'

const mythx = new Client('0x0000000000000000000000000000000000000000', 'trial', 'testTool');
```

Performing a `login` request

```typescript
// Logs in and returns an object containing access and refresh token
const tokens = await mythx.login()

```

Submitting an analysis using bytecode only

```typescript
const bytecode = '0xfe'
await mythx.submitBytecode(bytecode)
```

Getting a list of detected issues

```typescript
await mythx.getDetectedIssues('1111-2222-3333-4444')
```

### Logging in with MetaMask
In order to keep MythXJS as lean as possible we do not handle MetaMask integration ourself. Instead we provide two methods: getChallenge() and loginWithSignature() and leave the user handle the MetaMask integration the way they better prefer on their front end. This also lets the user work with their preffered version of `web3`.

Example using react app and `web3@1.0.0-beta.37`:
```typescript
const handleSignMessage = (account, data) => {
    try {
        return new Promise((resolve) => {
            const {value} = data.message
            if (!account) {
              console.error('no-account')
            }
              const params = [account, JSON.stringify(data)]
              web3.currentProvider.send(
                        { method: 'eth_signTypedData_v3', params, from: account },
                        (err, result) => {
                          if (err || result.error) {
                            console.error('Error with handling signature.', err)
                          }
                          resolve(value + '.' + result.result)
                        }
                    )
            }).catch((error) => {
              console.error(error)
            })
    } catch(err) {
        console.error(err)
    }
}

const loginWithMM = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]

    const data = await mythx.getChallenge(account.toLowerCase())
    
    handleSignMessage(account, data).then(
        async (message) => {
            // Returns set of tokens
            const result = await mythx.loginWithSignature(message)
        }
    ).catch(err => console.error(err))
}
```


## Documentation
For a complete list of functionality available on the library please check our [docs](https://consensys.github.io/mythxjs/classes/_apiservices_clientservice_.clientservice.html)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/ConsenSys/mythxjs/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

For the versions available, see [the tags on this repository](https://github.com/ConsenSys/mythxjs/tags).

## Projects using MythxJS

-   [MythX for VSCode](https://marketplace.visualstudio.com/items?itemName=mirkogarozzo.mythxvsc)
-   [truffle security](https://github.com/ConsenSys/truffle-security)
-   [remix-mythx-plugin](https://github.com/aquiladev/remix-mythx-plugin)

## See also

-   [openapi spec](https://api.mythx.io/v1/openapi) for details of the MythX API.
-   [MythX Developer and User Guide](https://docs.mythx.io/) for more information
-   [MythX Discord channel](https://discord.gg/kktn8Wt) to join the MythX community.
