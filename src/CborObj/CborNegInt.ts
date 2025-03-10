import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
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
        assert(
            neg < 0,
            "neg CBOR numbers must be less than 0; got: " + neg
        );
        neg = BigInt( neg );

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums
        if( neg < minBigInt )
        {
            neg = BigInt(-1) - BigInt(neg);
            let hex = neg.toString(16);
            if( (hex.length % 2) === 1 ) hex = "0" + hex;
            this.bigNumEncoding = new CborBytes( fromHex( hex ) );
        }

        this._num = BigInt( neg );
    }

    addInfos: number;
    bigNumEncoding: CborBytes | undefined;

    isBigNum(): boolean
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
        
        this.num = neg;
        this.addInfos = addInfos ?? headerFollowingToAddInfos( neg );
        // this.followingHeaderBytes = followingHeaderBytes;

        if( bigNumEncoding instanceof CborBytes )
            this.bigNumEncoding = bigNumEncoding;
        else
            this.bigNumEncoding = undefined;
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
            encoding = BigInt(-1) - BigInt(encoding); // translate to positive (so we can hex it)
            n = encoding;
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