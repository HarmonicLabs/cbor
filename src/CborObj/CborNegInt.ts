import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { CborBytes } from "./CborBytes";
import { isCborObj } from ".";

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

export interface CborNegIntMetaCaseFinite {
    headerAddInfos: number
    headerFollowingBytes: Uint8Array
}

export function isCborNegIntMetaCaseFinite( stuff: any ): stuff is CborNegIntMetaCaseFinite
{
    return (
        isObject( stuff ) &&
        typeof stuff.headerAddInfos === "number" &&
        isUint8Array( stuff.headerFollowingBytes )
    );
}

export function cloneCborNegIntMetaCaseFinite( meta: CborNegIntMetaCaseFinite ): CborNegIntMetaCaseFinite
{
    return {
        headerAddInfos: meta.headerAddInfos,
        headerFollowingBytes: Uint8Array.prototype.slice.call( meta.headerFollowingBytes )
    };
}

export interface CborNegIntMetaCaseBigNum {
    wrappedBytes: CborBytes
}

export function isCborNegIntMetaCaseBigNum( stuff: any ): stuff is CborNegIntMetaCaseBigNum
{
    return (
        isObject( stuff ) &&
        isCborObj( stuff.wrappedBytes )
    );
}

export function cloneCborNegIntMetaCaseBigNum( meta: CborNegIntMetaCaseBigNum ): CborNegIntMetaCaseBigNum
{
    return {
        wrappedBytes: meta.wrappedBytes
    };
}

export type CborNegIntMeta = 
    {
        isBigNum: false,
        meta: CborNegIntMetaCaseFinite
    } | {
        isBigNum: true,
        meta: CborNegIntMetaCaseBigNum
    };

export function isCborNegIntMeta( stuff: any ): stuff is CborNegIntMeta
{
    return (
        isObject( stuff ) &&
        (
            ( stuff.isBigNum === true && isCborNegIntMetaCaseBigNum( stuff.meta ) )   ||
            ( stuff.isBigNum === false && isCborNegIntMetaCaseFinite( stuff.meta ) )
        )
    )
}

export function cloneCborNegIntMeta( meta: CborNegIntMeta ): CborNegIntMeta
{
    if( meta.isBigNum )
    {
        return {
            isBigNum: true,
            meta: cloneCborNegIntMetaCaseBigNum( meta.meta )
        };
    }
    else
    {
        return {
            isBigNum: false,
            meta: cloneCborNegIntMetaCaseFinite( meta.meta )
        };
    }
}

export class CborNegInt
    implements ToRawObj, Cloneable<CborNegInt>
{
    private readonly _num : bigint;
    get num(): bigint
    {
        return this._num;
    }

    private readonly _metadata: CborNegIntMeta | undefined;
    get metadata(): CborNegIntMeta | undefined
    {
        return this._metadata;
    }
    
    constructor( 
        neg: number | bigint,
        metadata?: CborNegIntMeta
    )
    {
        neg = typeof neg === "number" ? BigInt( neg ) : neg;

        assert(
            typeof neg === "bigint" &&
            neg < BigInt( 0 ),
            "neg CBOR numbers must be less than 0; got: " + neg
        );

        this._num = neg;

        this._metadata = isCborNegIntMeta( metadata ) ? cloneCborNegIntMeta( metadata ) : undefined;
    }

    toRawObj(): RawCborNegInt
    {
        return {
            neg: this.num
        };
    }

    clone(): CborNegInt
    {
        return new CborNegInt( this.num );
    }
}
