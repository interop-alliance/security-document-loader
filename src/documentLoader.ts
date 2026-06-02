/*!
 * Copyright (c) 2026 Interop Alliance.
 */
import { driver } from '@interop/did-method-key'
import * as didWeb from '@interop/did-web-resolver'
import * as vc2Context from '@digitalcredentials/credentials-v2-context'
import * as vcBitstringStatusListContext from '@digitalbazaar/vc-bitstring-status-list-context'
import vc1Context from 'credentials-context'
import vcStatusListContext from '@digitalbazaar/vc-status-list-context'
import dataIntegrityContext from '@digitalbazaar/data-integrity-context'
import { Ed25519VerificationKey } from '@interop/ed25519-verification-key'
import { CachedResolver } from '@interop/did-io'
import didContext from 'did-context'
import ed25519Context from 'ed25519-signature-2020-context'
import x25519Context from 'x25519-key-agreement-2020-context'
import zcapContext from '@digitalbazaar/zcap-context'
import { JsonLdDocumentLoader } from 'jsonld-document-loader'
import obContext from '@digitalcredentials/open-badges-context'
import multikeyContext from '@digitalbazaar/multikey-context'
import aesContext from 'aes-key-wrapping-2019-context'
import hmacContext from 'sha256-hmac-key-2019-context'
import { httpClient } from '@interop/http-client'
import type { IDocumentLoader } from '@interop/data-integrity-core/loader'
import { parseResponseBody } from './parseResponse.js'

const resolver = new CachedResolver()
const didKeyDriver = driver()
const didWebDriver = didWeb.driver()
resolver.use(didKeyDriver)
resolver.use(didWebDriver)

didWebDriver.use({ keyPairClass: Ed25519VerificationKey })

didKeyDriver.use({ keyPairClass: Ed25519VerificationKey })

export const httpClientHandler = {
  /**
   * @param {object} options - Options hashmap.
   * @param {string} options.url - Document URL.
   * @returns {Promise<{contextUrl: null, document, documentUrl}>} - Resolves
   *   with documentLoader document.
   */
  async get(params: { url: string }): Promise<unknown> {
    if (!params.url.startsWith('http')) {
      throw new Error('NotFoundError')
    }
    let result
    try {
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
      result = await httpClient.get(params.url, { headers, parseBody: false })
    } catch (e) {
      throw new Error(
        `NotFoundError loading "${params.url}": ${(e as Error).message}`,
        { cause: e }
      )
    }

    return parseResponseBody(result)
  }
}

declare class IJsonLdDocumentLoader {
  addStatic: (contextUrl: string, context: any) => void
  setDidResolver: any
  setProtocolHandler: any
  documentLoader: any
  build: () => IDocumentLoader
}

interface SecurityLoaderParams {
  fetchRemoteContexts?: boolean
  useOBv3BetaContext?: boolean
}

export function securityLoader({
  fetchRemoteContexts = false,
  useOBv3BetaContext = false
}: SecurityLoaderParams = {}): IJsonLdDocumentLoader {
  const loader: IJsonLdDocumentLoader = new JsonLdDocumentLoader()

  // Ed25519 Signature 2020 Context
  loader.addStatic(
    ed25519Context.constants.CONTEXT_URL,
    ed25519Context.contexts.get(ed25519Context.constants.CONTEXT_URL)
  )

  // X25519 Key Agreement 2020 Context
  loader.addStatic(
    x25519Context.constants.CONTEXT_URL,
    x25519Context.contexts.get(x25519Context.constants.CONTEXT_URL)
  )

  // DID Context
  loader.addStatic(
    didContext.constants.DID_CONTEXT_URL,
    didContext.contexts.get(didContext.constants.DID_CONTEXT_URL)
  )

  // Verifiable Credentials Data Model 1.0 Context
  loader.addStatic(vc1Context.CONTEXT_URL, vc1Context.CONTEXT)

  // Verifiable Credentials Data Model 2.0 Context - BETA / non-final
  loader.addStatic(vc2Context.CONTEXT_URL, vc2Context.CONTEXT)

  // Data Integrity Context
  for (const [url, context] of dataIntegrityContext.contexts) {
    loader.addStatic(url, context)
  }

  // Bitstring Status List Context
  loader.addStatic(
    vcBitstringStatusListContext.CONTEXT_URL,
    vcBitstringStatusListContext.CONTEXT
  )

  // Status List 2021 Context (DEPRECATED)
  loader.addStatic(
    vcStatusListContext.CONTEXT_URL_V1,
    vcStatusListContext.CONTEXT_V1
  )

  // zCap Context (Authorization Capabilities v0.3)
  loader.addStatic(zcapContext.CONTEXT_URL, zcapContext.CONTEXT)

  // Multikey Context
  loader.addStatic(multikeyContext.CONTEXT_URL, multikeyContext.CONTEXT)

  // AES Key Wrapping 2019 Context
  loader.addStatic(
    aesContext.constants.CONTEXT_URL,
    aesContext.contexts.get(aesContext.constants.CONTEXT_URL)
  )

  // SHA-256 HMAC Key 2019 Context
  loader.addStatic(
    hmacContext.constants.CONTEXT_URL,
    hmacContext.contexts.get(hmacContext.constants.CONTEXT_URL)
  )

  // Open Badges v3 Contexts, includes OBv3 Beta, 3.0, 3.0.1, 3.0.2, etc.
  for (const [url, context] of obContext.contexts) {
    loader.addStatic(url, context)
  }

  if (useOBv3BetaContext) {
    // Workaround to validate legacy OBv3 BETA context VCs
    loader.addStatic(
      obContext.CONTEXT_URL_V3_0_0,
      obContext.contexts.get(obContext.CONTEXT_URL_V3_BETA)
    )
  }

  loader.setDidResolver(resolver)

  // Enable loading of arbitrary contexts from web
  if (fetchRemoteContexts) {
    loader.setProtocolHandler({ protocol: 'http', handler: httpClientHandler })
    loader.setProtocolHandler({ protocol: 'https', handler: httpClientHandler })
  }

  return loader
}
