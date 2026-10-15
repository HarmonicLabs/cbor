import {  } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";

import { ToRawObj } from "./interfaces/ToRawObj";
import { ICborObj } from "./interfaces/ICborObj";
import { CborBytes } from "./CborBytes";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { maxBigInt } from "../constants/max";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";
import { SubCborRef } from "../SubCborRef";

export type RawCborUInt = {
    uint: bigint
}

export function isRawCborUnsigned( unsign: RawCborUInt ): boolean
{
    if( typeof unsign !== "object" || unsign === null ) return false;
    
    const keys = Object.keys( unsign );

    return (
        keys.includes("uint")  &&
        typeof unsign.uint === "bigint" &&
        unsign.uint >= 0
    );
}

export class CborUInt
    implements ToRawObj, Cloneable<CborUInt>, ICborObj
{
    private _num: bigint;
    get num(): bigint
    {
        if( this.bigNumEncoding instanceof CborBytes )
        {
            this._num = BigInt(
                "0x" +
                toHex( this.bigNumEncoding.bytes )
            );
        }
        return this._num;
    }
    set num( uint: bigint | number )
    {
        if(!(
            uint >= BigInt( 0 )
        )) throw new Error(
            "uint CBOR numbers must be greater or equal 0; got: " + uint
        );
        uint = BigInt( uint );

        if( uint > maxBigInt )
        {
            let hex = uint.toString(16);
            if( (hex.length % 2) === 1 ) hex = "0" + hex;
            this.bigNumEncoding = new CborBytes( fromHex( hex ) );
        }

        this._num = uint;
    }
    
    addInfos: number;
    bigNumEncoding: CborBytes | undefined;

    /**
     * `true` when this integer is represented as an RFC 8949 bignum
     * (tag 2 over a byte string) rather than a major-type integer head.
     *
     * For objects returned by `Cbor.parse` / `Cbor.parseWithOffset` this is
     * `true` exactly when the source bytes were a `#6.2(bytes)` bignum,
     * whatever the value (`c24101` included); integers read from a
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
        uint: number | bigint,
        addInfos?: number,
        bigNumEncoding?: CborBytes,
        public subCborRef?: SubCborRef
    )
    {
        this.num = uint; // may derive `bigNumEncoding` for out-of-range values
        this.addInfos = addInfos ?? headerFollowingToAddInfos( uint );
        // ONLY an explicit encoding overrides what the setter derived; the
        // unconditional `else undefined` used to discard it, which is why
        // every integer above 2^64 hit the encoder's "bigNumEncoding is not
        // set" warn-and-recover path and dumped itself to the console.
        if( bigNumEncoding instanceof CborBytes )
            this.bigNumEncoding = bigNumEncoding;
    }

    static bigNum(
        encoding: CborBytes | bigint | number,
        subCborRef?: SubCborRef
    ): CborUInt
    {
        let n: bigint | undefined = undefined;
        if(!( encoding instanceof CborBytes ))
        {
            encoding = BigInt(encoding);
            n = encoding;
            let hex = encoding.toString(16);
            if( (hex.length % 2) === 1 ) hex = "0" + hex;
            encoding = new CborBytes( fromHex( hex ) );
        }
        else { n = BigInt( "0x" + toHex( encoding.bytes ) ); }
        
        return new CborUInt( n, 0, encoding, subCborRef );
    }

    toRawObj(): RawCborUInt
    {
        return {
            uint: this.num
        };
    }

    clone(): CborUInt
    {
        return new CborUInt(
            this.num,
            this.addInfos,
            this.bigNumEncoding?.clone(),
            this.subCborRef?.clone()
        );
    }
}