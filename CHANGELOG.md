# Changelog

## 2.1.0

Conformance with cardano-ledger's CBOR handling, made for pragma-org's
[node-diversity-conformance](https://github.com/pragma-org/node-diversity-conformance) `cbor-decoding` scenario
(Gerolamo scores 9 200 / 9 200 with this release). Item numbers refer to the scenario's list in Gerolamo's
`docs/parity/ndc-cbor-decoding.md`; `CONFORMANCE.md` has the details.

### Added
- `CborText.isDefiniteLength`, like `CborBytes.isDefiniteLength` (570).
- `CborPositiveRational.fromCborObj`, which throws where `fromCborObjOrUndef` returns `undefined` (576).
- `CborTag.addInfos`: the head width of a tag number, kept from the source and honoured by `Cbor.encode` (584).

### Changed
- `CborUInt` / `CborNegInt.isBigNum()` reliably reports a parsed `#6.2` / `#6.3` bignum (572). Still a method.
- Parsed tags keep their source bytes (`subCborRef`) and head width, so re-encoding reproduces the input (584).

### Fixed
- An empty bignum magnitude (`c240` / `c340`) decodes as 0 / −1 instead of throwing (583).
- An indefinite-length tag head (`0xdf`) is rejected; it parsed as tag −1.
- `CborPositiveRational.fromCborObjOrUndef` accepts only `#6.30([uint, uint])` (576).

### Compatibility
No API was removed or changed in shape. Behaviour differs only on input that is not valid for its purpose: a rational
with another tag or more elements, an `0xdf` tag head, an empty bignum.
