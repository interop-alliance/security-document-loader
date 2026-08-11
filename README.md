# JSON-LD Document Loader _(interop/security-document-loader)_

[![Node.js CI](https://github.com/interop-alliance/security-document-loader/workflows/CI/badge.svg)](https://github.com/interop-alliance/security-document-loader/actions?query=workflow%3A%22CI%22)
[![NPM Version](https://img.shields.io/npm/v/@interop/security-document-loader.svg)](https://npm.im/@interop/security-document-loader)

> A secure and convenient JSON-LD document loader for Node.js, browsers, and
> React Native.

## Table of Contents

- [Background](#background)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Background

Included functionality:

- Bundled contexts (see [Included Contexts](#included-contexts) below)
- DID resolver for `did:key` and `did:web`
- Optional loading of arbitrary contexts from the web (see Usage).

### Included Contexts

The default loader bundles the following contexts (registered in
`src/documentLoader.ts`):

| Context                               | Package                                           | URL                                                                                            |
| ------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Ed25519 Signature 2020                | `ed25519-signature-2020-context`                  | `https://w3id.org/security/suites/ed25519-2020/v1`                                             |
| X25519 Key Agreement 2020             | `x25519-key-agreement-2020-context`               | `https://w3id.org/security/suites/x25519-2020/v1`                                              |
| DID                                   | `did-context`                                     | `https://www.w3.org/ns/did/v1`                                                                 |
| Verifiable Credentials Data Model 1.0 | `credentials-context`                             | `https://www.w3.org/2018/credentials/v1`                                                       |
| Verifiable Credentials Data Model 2.0 | `@digitalcredentials/credentials-v2-context`      | `https://www.w3.org/ns/credentials/v2`                                                         |
| Data Integrity                        | `@digitalbazaar/data-integrity-context`           | `https://w3id.org/security/data-integrity/v1`, `https://w3id.org/security/data-integrity/v2`   |
| Bitstring Status List                 | `@digitalbazaar/vc-bitstring-status-list-context` | `https://www.w3.org/ns/credentials/status/v1`                                                  |
| Status List 2021 (deprecated)         | `@digitalbazaar/vc-status-list-context`           | `https://w3id.org/vc/status-list/2021/v1`                                                      |
| Authorization Capabilities (zCap)     | `@digitalbazaar/zcap-context`                     | `https://w3id.org/zcap/v1`                                                                     |
| Multikey                              | `@digitalbazaar/multikey-context`                 | `https://w3id.org/security/multikey/v1`                                                        |
| AES Key Wrapping 2019                 | `aes-key-wrapping-2019-context`                   | `https://w3id.org/security/suites/aes-2019/v1`                                                 |
| SHA-256 HMAC Key 2019                 | `sha256-hmac-key-2019-context`                    | `https://w3id.org/security/suites/hmac-2019/v1`                                                |
| Open Badges v3                        | `@digitalcredentials/open-badges-context`         | `https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json` (and prior 3.0.x / beta versions) |

## Install

- Node.js 20+ is recommended.

### NPM

To install via NPM:

```
npm install @interop/security-document-loader
```

### Development

To install locally (for development):

```
git clone https://github.com/interop-alliance/security-document-loader.git
cd security-document-loader
npm install
```

## Usage

To get a default document loader (with the stock set of bundled contexts):

```js
import { securityLoader } from '@interop/security-document-loader'

const documentLoader = securityLoader().build()
```

To add additional contexts:

```js
import { securityLoader } from '@interop/security-document-loader'

const loader = securityLoader()
loader.addStatic('https://example.com/my-context/v1', contextObject)

const documentLoader = loader.build()
```

### React Native

This library caches documents via its `jsonld-document-loader` dependency, which
calls the global [`structuredClone`][]. React Native's Hermes engine does **not**
provide `structuredClone`, so calling `.build()` (or `addStatic`) will throw
`ReferenceError: Property 'structuredClone' doesn't exist` unless you install a
shim before this loader is used (e.g. in your app's entry/`shim.js`):

```js
if (typeof structuredClone === 'undefined') {
  // Sufficient for JSON-LD context/DID documents, which are plain JSON.
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value))
}
```

If you need full structured-clone semantics (`Date`/`Map`/`Set`/typed arrays),
use a faithful polyfill such as [`@ungap/structured-clone`][] instead.

[`structuredClone`]: https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
[`@ungap/structured-clone`]: https://www.npmjs.com/package/@ungap/structured-clone

### Fetching From the Web

To enable fetching arbitrary contexts from the web (not recommended, if you can
avoid it):

```js
const documentLoader = securityLoader({ fetchRemoteContexts: true }).build()
```

### Supported URL Protocol Handlers

Out of the box, this library supports loading the following documents:

- Explicitly added URLs from static local caches (that is, ones that you
  explicitly add via `loader.addStatic`)
- DID Documents using the `did:key` and `did:web` methods.

Additionally, if your use case allows it, you can enable `fetchRemoteContexts`,
which will add support for URLs using the `http` and `https` protocols (see
previous section).

#### Adding Custom Protocol Handlers

Sometimes you will need to add documents with other URL protocols. If you have
internal code to resolve those protocols (for example, you can fetch some
`urn:` documents from a local database), you can write a custom protocol
handler:

```js
import { securityLoader } from '@interop/security-document-loader'

function getDocument(url) {
  // Some internal function that fetches or creates documents
}

const customResolver = {
  /**
   * @param {object} options - Options hashmap.
   * @param {string} options.url - Document URL (here `urn:...` key id)
   * @returns {Promise<object>} - Resolves with key object document.
   */
  async get(params: Record<string, string>): Promise<unknown> {
    let document
    try {
      document = await getDocument(params.url)
    } catch (e) {
      throw new Error('NotFoundError')
    }

    return document
  }
};

// For example, use your `getDocument` function to resolve all `urn:` URIs:
securityLoader.setProtocolHandler({protocol: 'urn', handler: customResolver})

const documentLoader = securityLoader().build()
```

## Contribute

PRs accepted.

See [CONTRIBUTING.md](CONTRIBUTING.md) -- code style and contribution
conventions.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT License](LICENSE.md) © 2022 Digital Credentials Consortium.
