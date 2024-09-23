import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { CborBytes } from "./CborBytes";

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

export interface CborUIntMetaCaseFinite {
    headerAddInfos: number
    headerFollowingBytes: Uint8Array
}

export function isCborUIntMetaCaseFinite( stuff: any ): stuff is CborUIntMetaCaseFinite
{
    return (
        isObject( stuff ) &&
        typeof stuff.headerAddInfos === "number" &&
        isUint8Array( stuff.headerFollowingBytes )
    );
}

export function cloneCborUIntMetaCaseFinite( meta: CborUIntMetaCaseFinite ): CborUIntMetaCaseFinite
{
    return {
        headerAddInfos: meta.headerAddInfos,
        headerFollowingBytes: Uint8Array.prototype.slice.call( meta.headerFollowingBytes )
    };
}

export interface CborUIntMetaCaseBigNum {
    wrappedBytes: CborBytes
}

export type CborUIntMeta
    = {
        isBigNum: false,
        meta: CborUIntMetaCaseFinite
    } | {
        isBigNum: true,
        meta: CborUIntMetaCaseBigNum
    }

export function isCborUIntMeta( stuff: any ): stuff is CborUIntMeta
{
    return (
        isObject( stuff ) &&
        (
            ( stuff.isBigNum === true && isCborUIntMetaCaseBigNum( stuff.meta ) ) ||
            ( stuff.isBigNum === false && isCborUIntMetaCaseFinite( stuff.meta ) )
        )
    )
}

export function cloneCborUIntMeta( meta: CborUIntMeta ): CborUIntMeta
{
    return TODO;
}

export class CborUInt
    implements ToRawObj, Cloneable<CborUInt>
{
    private readonly _num : bigint;
    get num(): bigint
    {
        return this._num;
    }

    private readonly _metadata: CborUIntMeta | undefined;
    get metadata(): CborUIntMeta | undefined
    {
        return this._metadata;
    }
    
    constructor( 
        uint: number | bigint,
        metadata?: CborUIntMeta
    )
    {
        if( typeof uint === "number" )
        {
            uint = BigInt( uint );
        }

        assert(
            typeof uint === "bigint" &&
            uint >= BigInt( 0 ),
            "uint CBOR numbers must be greater or equal 0; got: " + uint
        );

        this._num = uint;

        this._metadata = undefined;

        if( isCborUIntMeta( metadata ) )
        {
            this._metadata = cloneCborUIntMeta( metadata );
        }
    }

    toRawObj(): RawCborUInt
    {
        return {
            uint: this.num
        };
    }

    clone(): CborUInt
    {
        return new CborUInt( this.num )
    }
}
