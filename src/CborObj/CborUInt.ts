import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
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
        assert(
            uint >= BigInt( 0 ),
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

    isBigNum(): boolean
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
        this.num = uint;
        this.addInfos = addInfos ?? headerFollowingToAddInfos( uint );
        if( bigNumEncoding instanceof CborBytes )
            this.bigNumEncoding = bigNumEncoding;
        else
            this.bigNumEncoding = undefined;
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