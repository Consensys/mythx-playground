# omni-fetch

> wrapper for isomorphic fetch with proxy support

omni-fetch combines the excellent
[isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
and
[caw](https://github.com/kevva/caw)
modules to enable easy http and https proxy support for your node
application.

## Installation

```bash
npm install --save omni-fetch isomorphic-fetch
```

## Usage

```js
import fetch from 'omni-fetch';
fetch('https://www.sinnerschrader.com');
```

---

⇨ See the
[fetch documenation](https://github.com/matthew-andrews/isomorphic-fetch#usage)
for details

### Proxy Support

Specify proxy configuration via `HTTP_PROXY`
and `HTTPS_PROXY` environment variables,
or their all-lowercase twins.
Assuming a local proxy server available at `http://localhost:8080`:

```bash
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
npm start
```

---

⇨ The specified proxy configuration will be picked up for all
communication via `omni-fetch` on the server-side.
Client-side `fetch` will use the client's proxy configuration.

### Overriding global configuration

`omni-fetch` default proxy configuration can be overridden by
passing an `agent` option to fetch:

```js
import https from 'https';
import fetch from 'omni-fetch';

process.env.HTTPS_PROXY = 'http://localhost:8080';

// Uses http://localhost:8080
fetch('https://sinnerschrader.com');

// Uses no proxy
fetch('https://sinnerschrader.com', {
  agent: https.globalAgent
});
```

---

Copyright 2016 by [Mario Nebl](https://github.com/marionebl)
and [contributors](./graphs/contributors). Released under the [MIT license]('./license.md').
