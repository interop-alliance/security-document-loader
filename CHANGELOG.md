# @interop/security-document-loader Changelog

## 10.0.0 - 2026-08-10

### Removed

- **BREAKING**: Remove the `byoe-context` (BYOE App Connect,
  `https://w3id.org/byoe/app-connect/v1`) context from the default loader.
  Consumers that need it register it themselves before building:
  `for (const [url, context] of byoeContext.contexts) loader.addStatic(url, context)`.
  This keeps BYOE vocabulary additions from forcing a release of this package.

## 9.5.1 - 2026-08-01

### Changed
- Update to `byoe-context@0.2.0` (adds the `LoginCredential` and
  `preferredUsername` terms to the App Connect context).

## 9.5.0 - 2026-08-01

### Added
- Add `byoe-context` (BYOE App Connect context, `https://w3id.org/byoe/app-connect/v1`)
  to the default document loader.

## 9.4.3-9.4.4 - 2026-07-19

### Changed
- Update to latest `did-web-resolver@6.3.0` (allow did:web localhost http).

## 9.4.2 - 2026-07-17

### Changed
- Update to `@interop/data-integrity-core@8.3.0` and related.

## 9.4.1 - 2026-06-28

### Fixed

- Update to latest `@interop/http-client@1.0.4` and related.

## 9.4.0 - 2026-06-15

### Added

- `securityLoader()` now accepts an optional `didResolver` to override the
  built-in DID resolver, so consumers can resolve additional DID methods (e.g.
  `did:webvh`) without this package taking on their method-specific
  dependencies. Defaults to the built-in `did:key` + `did:web` resolver, so
  existing zero-argument calls are unaffected.
- Export `createDefaultDidResolver()`, the single source of truth for the
  built-in DID driver set (`did:key` + `did:web`), so consumers can start from
  the defaults, register their own driver, and pass the result back in via
  `securityLoader({ didResolver })`.

## 9.3.1 - 2026-06-13

### Changed
- Update to `@interop/data-integrity-core@^8.0.0`

## 9.3.0 - 2026-06-09

### Added

- Register ECDSA (`P-256` / `P-384` / `P-521`) verification suites on the
  built-in `did:key` resolver, alongside Ed25519, so the document loader can
  resolve ECDSA `did:key` verification methods (e.g. for verifying
  `ecdsa-rdfc-2019` proofs). Adds `@interop/ecdsa-multikey` as a dependency.
- Export `registerDefaultDidKeyHeaders(didKeyDriver)`, the single source of
  truth for the standard `did:key` header set (Ed25519 + ECDSA), so consumers
  that build their own `did:key` driver (e.g. `@interop/verifier-core`) can
  register the same suites and stay in sync.

## 9.2.3 - 2026-06-09

### Changed
- Update to `@interop/data-integrity-core@^7.0.0`

## 9.2.2 - 2026-06-06

### Added

- Add default export to `package.json`.

## 9.2.1 - 2026-06-01

### Changed
- Update to latest interop deps.

## 9.2.0 - 2026-06-01

### Added
- Add `@digitalbazaar/multikey-context`

## 9.1.0 - 2026-06-01

### Added
- Add `aes-key-wrapping-2019-context` and `sha256-hmac-key-2019-context`

### Changed
- Use loader-related types from `@interop/data-integrity-core`

## 9.0.1-9.0.2 - 2026-05-27

### Changed
- **BREAKING**: Forked from `@digitalcredentials/security-document-loader@v9.0.0`
- **BREAKING**: Remove DCC context (no longer used).
- Switch to `@interop/http-client`, `@interop/did-web-resolver`, `@interop/did-method-key`

## 9.0.0 - 2026-05-22
### Added
- Add `@digitalbazaar/zcap-context`

## 8.0.0 - 2025-05-22
### Changed
- **BREAKING**: updated @digitalcredentials/credentials-v2-context and
digitalcredentials/open-badges-context to include latest OBv3.0.3 and VC DM 2.0
contexts

## 7.0.0 - 2025-04-30
### Changed
- switch to `@digitalcredentials/did-method-web` from `@interop/did-web-resolver` for did-web resolution
- rework build process
- update dependencies
- **BREAKING**: remove cjs build

## 6.0.1 - 2024-11-12
### Fixed
- Fix Typescript types declaration ([PR #17](https://github.com/digitalcredentials/security-document-loader/pull/17/files)).

## 6.0.0 - 2024-08-04
### Added
- Add support for VC DM 2.0 context

### Changed
- **BREAKING**: Switch to `@digitalcredentials/http-client` fork.

## 5.0.0 - 2024-02-10
### Changed
- **BREAKING**: For the HTTP protocol handler (for fetching un-cached documents
  from the web), switch to using `@digitalbazaar/http-client` instead of the
  global `fetch()` object. Improves React Native compatibility.

## 4.0.0 - 2024-01-23
### Changed
- **BREAKING**: Use the Typescript-enabled `@interop/did-web-resolver@4.0.0`,
  which uses DigitalBazaar's version of `http-client`,
  and updated `@digitalcredentials/bnid@3.0.1`.
  Usage and API should remain unchanged, but bumping to major semver due to
  significant backend change.

## 3.2.0 - 2024-01-23
### Added
- Add support for OBv3 v3.0.3 and Extensions contexts.

## 3.1.0 - 2023-07-16
### Added
- Add support for optionally loading OBv3 BETA context.

## 3.0.0 - 2023-07-16
### Changed
- **BREAKING**: Now includes OBv3 contexts from beta to 3.0.2

## 2.0.0 - 2023-05-17
### Changed
- **Breaking**: Update OpenBadges v3 context to `v1.0.0`.

## 1.0.0 - TBD

### Added

- Initial commit.
