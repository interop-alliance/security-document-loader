# JSON-LD Document Loader _(interop/security-document-loader)_

[![Node.js CI](https://github.com/interop-alliance/security-document-loader/workflows/CI/badge.svg)](https://github.com/interop-alliance/security-document-loader/actions?query=workflow%3A%22CI%22)
[![NPM Version](https://img.shields.io/npm/v/@interop/security-document-loader.svg)](https://npm.im/@interop/security-document-loader)

> A secure and convenient JSON-LD document loader for Node.js, browsers, and React Native.

## Table of Contents

- [Background](#background)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Background

Included functionality:

* Bundled contexts:
  - DID, VC 1.0, DCC, Open Badges v3, ed25519 and x25519 crypto suite contexts
* DID resolver for `did:key` and `did:web`
* Optional loading of arbitrary contexts from the web (see Usage).

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
import { securityLoader } from 'interop/security-document-loader'

const loader = securityLoader()
loader.addStatic('https://example.com/my-context/v1', contextObject)

const documentLoader = loader.build()
```

### Fetching From the Web
To enable fetching arbitrary contexts from the web (not recommended, if you can
avoid it):

```js
const documentLoader = securityLoader({ fetchRemoteContexts: true }).build()
```

### Supported URL Protocol Handlers

Out of the box, this library supports loading the following documents:

* Explicitly added URLs from static local caches (that is, ones that you
  explicitly add via `loader.addStatic`)
* DID Documents using the `did:key` and `did:web` methods.

Additionally, if your use case allows it, you can enable `fetchRemoteContexts`,
which will add support for URLs using the `http` and `https` protocols (see
previous section).

#### Adding Custom Protocol Handlers
Sometimes you will need to add documents with other URL protocols. If you have
internal code to resolve those protocols (for example, you can fetch some
`urn:` documents from a local database), you can write a custom protocol
handler:

```js
import { securityLoader } from 'interop/security-document-loader'

function getDocument (url) {
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
    } catch(e) {
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

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT License](LICENSE.md) © 2022 Digital Credentials Consortium.
