/**
 * Counts, over the cardano-cbor-dataset corpus (node-diversity-conformance
 * `cbor-decoding`, `conway-123-100`), the samples each cbor-level fix reaches.
 * The corpus is read as data only.
 *
 *   bun conformance/corpus.ts <dataset>/conway-123-100 [--baseline <cbor checkout with dist/>]
 *
 * - 583: samples holding an empty bignum magnitude (`c240` / `c340`): they
 *        threw in Cbor.parse before, they parse now
 * - 572: samples holding a `#6.2` / `#6.3` bignum, i.e. where `isBigNum` lets a
 *        ledger decoder tell a bignum from a plain integer
 * - 570: samples holding a chunked text (`CborText.isDefiniteLength === false`)
 *        or chunked bytes
 * - 576: tags over `[uint, uint]` that are not 30: CborPositiveRational used
 *        to read them as rationals, now rejects them
 * - parse/encode identity: samples whose `Cbor.encode(Cbor.parse(x))` is x
 *   (with `--baseline`, before vs after; 584 kept tag heads)
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Cbor, CborArray, CborBytes, CborMap, CborNegInt, CborObj, CborPositiveRational, CborTag, CborText, CborUInt } from "../src";
import { toHex } from "@harmoniclabs/uint8array-utils";

const args = process.argv.slice(2);
const dir = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--baseline");
if (!dir || !existsSync(dir)) throw new Error("usage: bun conformance/corpus.ts <dataset>/conway-123-100 [--baseline <cbor checkout>]");
const bi = args.indexOf("--baseline");
const Old: any = bi >= 0 ? require(resolve(args[bi + 1], "dist")) : undefined;

function walk(o: CborObj, f: (o: CborObj) => void): void {
    f(o);
    if (o instanceof CborArray) o.array.forEach(x => walk(x, f));
    else if (o instanceof CborMap) o.map.forEach(({ k, v }) => { walk(k, f); walk(v, f); });
    else if (o instanceof CborTag) walk(o.data, f);
}

type Counts = { samples: number, emptyBigNum: number, bigNum: number, chunkedText: number, chunkedBytes: number, nonRationalTag: number, identity: number, identityOld: number, parseFailOld: number, parseFail: number };
const rules = readdirSync(dir).filter(r => existsSync(join(dir, r, "valid")) || existsSync(join(dir, r, "invalid"))).sort();
const total: Counts = { samples: 0, emptyBigNum: 0, bigNum: 0, chunkedText: 0, chunkedBytes: 0, nonRationalTag: 0, identity: 0, identityOld: 0, parseFailOld: 0, parseFail: 0 };
const rows: string[] = [];

for (const rule of rules) {
    const c: Counts = { samples: 0, emptyBigNum: 0, bigNum: 0, chunkedText: 0, chunkedBytes: 0, nonRationalTag: 0, identity: 0, identityOld: 0, parseFailOld: 0, parseFail: 0 };
    const sets: string[] = [];
    if (existsSync(join(dir, rule, "valid"))) sets.push("valid");
    for (const z of existsSync(join(dir, rule, "invalid")) ? readdirSync(join(dir, rule, "invalid")) : []) sets.push(join("invalid", z));
    for (const s of sets) for (const f of readdirSync(join(dir, rule, s)).filter(f => f.endsWith(".cbor"))) {
        c.samples++;
        const bytes = new Uint8Array(readFileSync(join(dir, rule, s, f)));
        const hex = toHex(bytes);
        if (Old) {
            try { if (toHex(Old.Cbor.encode(Old.Cbor.parse(bytes))) === hex) c.identityOld++; }
            catch { c.parseFailOld++; }
        }
        let parsed: CborObj;
        try { parsed = Cbor.parse(bytes); } catch { c.parseFail++; continue; }
        if (toHex(Cbor.encode(parsed)) === hex) c.identity++;
        let empty = false, big = false, ct = false, cb = false, nrt = false;
        walk(parsed, o => {
            if ((o instanceof CborUInt || o instanceof CborNegInt) && o.isBigNum()) {
                big = true;
                if (o.bigNumEncoding!.bytes.length === 0) empty = true;
            }
            if (o instanceof CborText && !o.isDefiniteLength) ct = true;
            if (o instanceof CborBytes && !o.isDefiniteLength) cb = true;
            if (
                o instanceof CborTag && o.tag !== 30n && o.data instanceof CborArray &&
                o.data.array.length === 2 && o.data.array.every(x => x instanceof CborUInt) &&
                CborPositiveRational.fromCborObjOrUndef(o) === undefined
            ) nrt = true;
        });
        if (empty) c.emptyBigNum++;
        if (big) c.bigNum++;
        if (ct) c.chunkedText++;
        if (cb) c.chunkedBytes++;
        if (nrt) c.nonRationalTag++;
    }
    for (const k of Object.keys(total) as (keyof Counts)[]) total[k] += c[k];
    rows.push(`| ${rule} | ${c.samples} | ${c.emptyBigNum} | ${c.bigNum} | ${c.chunkedText} | ${c.chunkedBytes} | ${c.nonRationalTag} | ${Old ? c.parseFailOld + " → " : ""}${c.parseFail} | ${Old ? c.identityOld + " → " : ""}${c.identity} |`);
}
console.log(`| rule | samples | 583 empty bignum | 572 bignum | 570 chunked text | chunked bytes | 576 non-30 rational tag | parse throws | encode(parse(x)) == x |`);
console.log(`| --- | --- | --- | --- | --- | --- | --- | --- | --- |`);
rows.forEach(r => console.log(r));
console.log(`| total | ${total.samples} | ${total.emptyBigNum} | ${total.bigNum} | ${total.chunkedText} | ${total.chunkedBytes} | ${total.nonRationalTag} | ${Old ? total.parseFailOld + " → " : ""}${total.parseFail} | ${Old ? total.identityOld + " → " : ""}${total.identity} |`);
