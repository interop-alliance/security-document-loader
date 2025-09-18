/*!
 * Copyright (c) 2021 Interop Alliance and Dmitri Zagidulin. All rights reserved.
 */
import * as didKey from '@digitalcredentials/did-method-key';
import * as didWeb from '@digitalcredentials/did-method-web';
import * as vc2Context from '@digitalcredentials/credentials-v2-context';
import * as vcBitstringStatusListContext from '@digitalbazaar/vc-bitstring-status-list-context';
import vc1Context from 'credentials-context';
import vcStatusListContext from '@digitalbazaar/vc-status-list-context';
import dataIntegrityContext from '@digitalbazaar/data-integrity-context';
import * as Ed25519Multikey from '@digitalcredentials/ed25519-multikey';
// import { Ed25519VerificationKey2020 }
  // from '@digitalcredentials/ed25519-verification-key-2020';
// import { X25519KeyAgreementKey2020 }
  // from '@digitalcredentials/x25519-key-agreement-key-2020';
import { CachedResolver } from '@digitalcredentials/did-io';
import dccContext from '@digitalcredentials/dcc-context';
import didContext from 'did-context';
import ed25519Context from 'ed25519-signature-2020-context';
import x25519Context from 'x25519-key-agreement-2020-context';
import zcapContext from '@digitalbazaar/zcap-context';
import { JsonLdDocumentLoader } from 'jsonld-document-loader';
import obContext from '@digitalcredentials/open-badges-context';
import { httpClient } from '@digitalcredentials/http-client';
import { parseResponseBody } from './parseResponse.js';

const resolver = new CachedResolver();
const didKeyDriver = didKey.driver();
const didWebDriver = didWeb.driver();
resolver.use(didKeyDriver);
resolver.use(didWebDriver);

didWebDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519Multikey.from
});

didKeyDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519Multikey.from
});

export const httpClientHandler = {
  /**
   * @param {object} options - Options hashmap.
   * @param {string} options.url - Document URL.
   * @returns {Promise<{contextUrl: null, document, documentUrl}>} - Resolves
   *   with documentLoader document.
   */
  async get(params: Record<string, string>): Promise<unknown> {
    if(!params.url.startsWith('http')) {
      throw new Error('NotFoundError');
    }
    let result;
    try {
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      result = await httpClient.get(params.url, { headers, parseBody: false });
    } catch(e: any) {
      throw new Error(`NotFoundError loading "${params.url}": ${e.message}`);
    }

    return parseResponseBody(result);
  }
};

declare interface IDocumentLoaderResult {
  contextUrl?: string;
  documentUrl?: string;
  document: any;
}

type documentLoader = (url: string) => Promise<IDocumentLoaderResult>;

declare class IJsonLdDocumentLoader {
  addStatic: (contextUrl: string, context: any) => void;
  setDidResolver: any;
  setProtocolHandler: any;
  documentLoader: any;
  build: () => documentLoader;
}

interface SecurityLoaderParams {
  fetchRemoteContexts?: boolean;
  useOBv3BetaContext?: boolean;
}

export function securityLoader({ fetchRemoteContexts = false, useOBv3BetaContext = false }: SecurityLoaderParams = {}): IJsonLdDocumentLoader {
  const loader: IJsonLdDocumentLoader = new JsonLdDocumentLoader();

  // Ed25519 Signature 2020 Context
  loader.addStatic(
    ed25519Context.constants.CONTEXT_URL,
    ed25519Context.contexts.get(ed25519Context.constants.CONTEXT_URL),
  );

  // X25519 Key Agreement 2020 Context
  loader.addStatic(
    x25519Context.constants.CONTEXT_URL,
    x25519Context.contexts.get(x25519Context.constants.CONTEXT_URL),
  );

  // DID Context
  loader.addStatic(
    didContext.constants.DID_CONTEXT_URL,
    didContext.contexts.get(didContext.constants.DID_CONTEXT_URL),
  );

  // Verifiable Credentials Data Model 1.0 Context
  loader.addStatic(vc1Context.CONTEXT_URL, vc1Context.CONTEXT);

  // Verifiable Credentials Data Model 2.0 Context - BETA / non-final
  loader.addStatic(vc2Context.CONTEXT_URL, vc2Context.CONTEXT);

  // Data Integrity Context
  for (const [url, context] of dataIntegrityContext.contexts) {
    loader.addStatic(url, context)
  }

  // DCC Context
  loader.addStatic(dccContext.CONTEXT_URL_V1, dccContext.CONTEXT_V1);

  // Bitstring Status List Context
  loader.addStatic(vcBitstringStatusListContext.CONTEXT_URL, vcBitstringStatusListContext.CONTEXT);

  // Status List 2021 Context (DEPRECATED)
  loader.addStatic(vcStatusListContext.CONTEXT_URL_V1, vcStatusListContext.CONTEXT_V1);

  // zCap Context (Authorization Capabilities v0.3)
  loader.addStatic(zcapContext.CONTEXT_URL, zcapContext.CONTEXT);

  // Open Badges v3 Contexts, includes OBv3 Beta, 3.0, 3.0.1, 3.0.2, etc.
  for (const [url, context] of obContext.contexts) {
    loader.addStatic(url, context)
  }

  if (useOBv3BetaContext) {
    // Workaround to validate legacy OBv3 BETA context VCs
    loader.addStatic(obContext.CONTEXT_URL_V3_0_0,
      obContext.contexts.get(obContext.CONTEXT_URL_V3_BETA))
  }

  loader.setDidResolver(resolver);

  // Enable loading of arbitrary contexts from web
  if (fetchRemoteContexts) {
    loader.setProtocolHandler({protocol: 'http', handler: httpClientHandler});
    loader.setProtocolHandler({protocol: 'https', handler: httpClientHandler});
  }

  return loader;
}
