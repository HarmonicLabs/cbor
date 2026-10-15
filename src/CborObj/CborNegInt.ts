import { Cloneable } from "../utils/Cloneable";

import { ToRawObj } from "./interfaces/ToRawObj";
import { ICborObj } from "./interfaces/ICborObj";
import { CborBytes } from "./CborBytes";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { minBigInt } from "../constants/max";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";
import { SubCborRef } from "../SubCborRef";

export type RawCborNegInt = {
    neg: bigint
}

export function isRawCborNegative( neg: RawCborNegInt ): boolean
{
    if( typeof neg !== "object" || neg === null ) return false;
    
    const keys = Object.keys( neg );

    return (
        keys.includes("neg")  &&
        typeof neg.neg === "bigint" &&
        neg.neg < 0
    );
}

export interface BigNumInfos {

}

export class CborNegInt
    implements ToRawObj, Cloneable<CborNegInt>, ICborObj
{
    private _num: bigint;
    get num(): bigint
    {
        if( this.bigNumEncoding instanceof CborBytes )
        {
            this._num = -(
                BigInt(
                    "0x" +
                    toHex( this.bigNumEncoding.bytes )
                ) + BigInt( 1 )
            );
        }
        return this._num;
    }
    set num( neg: bigint | number )
    {
        if(!(
            neg < 0
        )) throw new Error(
            "neg CBOR numbers must be less than 0; got: " + neg
        );
        const value = BigInt( neg );

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums
        if( value < minBigInt )
        {
            // the tag-3 payload is `-1 - value`; it must stay SEPARATE from
            // the value itself. Reusing the variable here left a NEGATIVE
            // cbor object holding a POSITIVE number, so `Cbor.encode` threw
            // "encoding invalid negative integer as CBOR" and no integer
            // below -(2^64) could be serialised at all.
            let hex = ( BigInt(-1) - value ).toString(16);
            if( (hex.length % 2) === 1 ) hex = "0" + hex;
            this.bigNumEncoding = new CborBytes( fromHex( hex ) );
        }

        this._num = value;
    }

    addInfos: number;
    bigNumEncoding: CborBytes | undefined;

    /**
     * `true` when this integer is represented as an RFC 8949 bignum
     * (tag 3 over a byte string) rather than a major-type integer head.
     *
     * For objects returned by `Cbor.parse` / `Cbor.parseWithOffset` this is
     * `true` exactly when the source bytes were a `#6.3(bytes)` bignum,
     * whatever the value (`c34101` included); integers read from a
     * plain head are never bignums. Decoders of fixed-width fields
     * (cardano-ledger `decodeWord64` and friends) should reject it.
     *
     * For constructed objects it is `true` when the value will be encoded
     * as a bignum (`.bigNum(...)`, or a value outside the 64-bit head range).
     *
     * Read-only; encoding is unaffected.
     *
     * Previously a method (`isBigNum()`); it is now a read-only property.
     */
    get isBigNum(): boolean
    {
        return this.bigNumEncoding instanceof CborBytes;
    }
    
    constructor(
        neg: number | bigint,
        addInfos?: number,
        bigNumEncoding?: CborBytes,
        public subCborRef?: SubCborRef
    )
    {
        if( typeof neg === "number" ) neg = BigInt( neg );
        
        this.num = neg; // may derive `bigNumEncoding` for out-of-range values
        this.addInfos = addInfos ?? headerFollowingToAddInfos( neg );
        // this.followingHeaderBytes = followingHeaderBytes;

        // ONLY an explicit encoding overrides what the setter derived: the
        // unconditional `else undefined` used to discard it, so a value
        // needing a bignum lost its encoding on the way out of the
        // constructor.
        if( bigNumEncoding instanceof CborBytes )
            this.bigNumEncoding = bigNumEncoding;
    }

    static bigNum(
        encoding: CborBytes | bigint | number,
        subCborRef?: SubCborRef
    ): CborNegInt
    {
        if( typeof encoding === "number" ) encoding = BigInt( encoding );
        if( typeof encoding === "bigint" && encoding >= 0 ) encoding = -encoding; // ensure negative number
        let n: bigint | undefined = undefined;
        if(!( encoding instanceof CborBytes ))
        {
            n = encoding; // remember negative number
            encoding = BigInt(-1) - BigInt(encoding); // translate to positive so we can encode as bytes
            let hex = encoding.toString(16); // hex
            if( (hex.length % 2) === 1 ) hex = "0" + hex; // even length
            encoding = new CborBytes( fromHex( hex ) ); // bytes
        }
        else { n = BigInt(-1) - BigInt( "0x" + toHex( encoding.bytes ) ); } // was bytes
        
        return new CborNegInt( n, 0, encoding, subCborRef );
    }

    toRawObj(): RawCborNegInt
    {
        return {
            neg: this.num
        };
    }

    clone(): CborNegInt
    {
        return new CborNegInt(
            this.num,
            this.addInfos,
            this.bigNumEncoding?.clone(),
            this.subCborRef?.clone()
        );
    }
}