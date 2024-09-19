import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

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

export interface CborUIntMetadata {
    headerAddInfos: number
    headerFollowingBytes: Uint8Array
}

export function isCborUIntMetadata( stuff: any ): stuff is CborUIntMetadata
{
    return (
        isObject( stuff ) &&
        typeof stuff.headerAddInfos === "number" &&
        isUint8Array( stuff.headerFollowingBytes )
    );
}

export function cloneCborUIntMetadata( meta: CborUIntMetadata ): CborUIntMetadata
{
    return {
        headerAddInfos: meta.headerAddInfos,
        headerFollowingBytes: Uint8Array.prototype.slice.call( meta.headerFollowingBytes )
    };
}

export class CborUInt
    implements ToRawObj, Cloneable<CborUInt>
{
    private readonly _num : bigint;
    get num(): bigint
    {
        return this._num;
    }

    private readonly _metadata: CborUIntMetadata | undefined;
    get metadata(): CborUIntMetadata | undefined
    {
        return this._metadata;
    }
    
    constructor( 
        uint: number | bigint,
        metadata?: CborUIntMetadata
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

        if( isCborUIntMetadata( metadata ) )
        {
            this._metadata = cloneCborUIntMetadata( metadata );
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
