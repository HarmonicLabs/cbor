# Conformance fixes (branch `conformance-fixes`, base 2.0.2)

API added or changed for the node-diversity-conformance `cbor-decoding` items
(gerolamo `docs/parity/ndc-cbor-decoding.md`). Build: `npm run build` → `dist/`.

| item | API | meaning |
| --- | --- | --- |
| 572 | `CborUInt.isBigNum: boolean` (read-only getter) | `true` when parsed from `#6.2(bytes)`, any value (`c24101` too); `false` for every plain head (`00`..`1bffffffffffffffff`). Constructed objects: `true` when the value will be encoded as a bignum (`CborUInt.bigNum(..)`, or value > 2^64-1). |
| 572 | `CborNegInt.isBigNum: boolean` (read-only getter) | same for `#6.3(bytes)` / values < -2^64. |
| 570 | `CborText.isDefiniteLength: boolean` (getter) | `false` for an indefinite-length (chunked) text `7f .. ff`; the chunks stay in `CborText.chunks`. Mirrors the existing `CborBytes.isDefiniteLength`. |
| 583 | `CborUInt.bigNum(bytes)` / `.num` | an empty magnitude (`c240`) is 0 instead of throwing. |
| 583 | `CborNegInt.bigNum(bytes)` / `.num` | an empty magnitude (`c340`) is -1 instead of throwing. |
| 576 | `CborPositiveRational.fromCborObjOrUndef` | `undefined` unless the object is `#6.30([uint, uint])`. |
| 576 | `CborPositiveRational.fromCborObj` (new) | same check, throws instead of returning `undefined`. |
| 584 | `CborTag.subCborRef` | now set by `Cbor.parse` (keepRef, the default) like every other parsed object. |
| 584 | `CborTag.addInfos: number` (new; 4th constructor argument) | head width of the tag number; parsed from the source (`d9 0079` stays 3 bytes), minimal by default; honoured by `Cbor.encode`. Parsed tag numbers are bigints without precision loss. |
| — | `Cbor.parse` | rejects an indefinite-length tag head (`df ..`), which used to parse as tag -1. |

Breaking for callers of the old method form: `x.isBigNum()` becomes `x.isBigNum`
(a getter cannot be called; no caller existed in the HarmonicLabs libraries).
Note that a method reference is always truthy, so code written against the
property must not run on a build without this change.

Encoding is unchanged: a parsed bignum re-encodes with its tag and original
magnitude bytes (`c2420001` stays `c2420001`), and chunked strings re-encode
chunked.

How ledger-ts decoders are expected to use it (not done here):

```ts
if (!(c instanceof CborUInt) || c.isBigNum) throw new Error("expected uint");
if (!(b instanceof CborBytes) || !b.isDefiniteLength) throw new Error("expected definite bytes");
```
