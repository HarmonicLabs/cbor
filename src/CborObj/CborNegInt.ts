import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

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

export interface CborNegIntMetadata {
    headerAddInfos: number
    headerFollowingBytes: Uint8Array
}

export function isCborNegIntMetadata( stuff: any ): stuff is CborNegIntMetadata
{
    return (
        isObject( stuff ) &&
        typeof stuff.headerAddInfos === "number" &&
        isUint8Array( stuff.headerFollowingBytes )
    );
}

export function cloneCborNegIntMetadata( meta: CborNegIntMetadata ): CborNegIntMetadata
{
    return {
        headerAddInfos: meta.headerAddInfos,
        headerFollowingBytes: Uint8Array.prototype.slice.call( meta.headerFollowingBytes )
    };
}

export class CborNegInt
    implements ToRawObj, Cloneable<CborNegInt>
{
    private readonly _num : bigint;
    get num(): bigint
    {
        return this._num;
    }

    private readonly _metadata: CborNegIntMetadata | undefined;
    get metadata(): CborNegIntMetadata | undefined
    {
        return this._metadata;
    }
    
    constructor( 
        neg: number | bigint,
        metadata?: CborNegIntMetadata
    )
    {
        if( typeof neg === "number" ) neg = BigInt( neg );

        assert(
            typeof neg === "bigint" &&
            neg < BigInt( 0 ),
            "neg CBOR numbers must be less than 0; got: " + neg
        );

        this._num = neg;

        this._metadata = undefined;

        if( isCborNegIntMetadata( metadata ) )
        {
            this._metadata = cloneCborNegIntMetadata( metadata );
        }
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
