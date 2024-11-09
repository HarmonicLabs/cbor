import { concatUint8Array, isUint8Array } from "@harmoniclabs/uint8array-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { ICborObj } from "./interfaces/ICborObj";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";

export type RawCborBytes = {
    bytes: Uint8Array
}

export function isRawCborBytes( b: RawCborBytes ): boolean
{
    if( typeof b !== "object" || b === null ) return false;
    
    const keys = Object.keys( b );

    return (
        keys.includes("bytes") &&
        isUint8Array( b.bytes )
    );
}

export class CborBytes
    implements ToRawObj, Cloneable<CborBytes>, ICborObj
{
    /** @deprecated use `bytes` instead */
    get buffer(): Uint8Array { return this.bytes; }

    /** 
     * concatenates all the chunks
     * returns 
     **/
    get bytes(): Uint8Array
    {
        if( this.chunks instanceof Uint8Array )
            return Uint8Array.prototype.slice.call( this.chunks );

        return concatUint8Array( ...this.chunks.map( ch => ch.bytes ) );
    }

    /**
     * if the bytes where of definite length this just wraps the `bytes`
     * property in a single element array
     * 
     * if the bytes where of indefinite length this array has more than one element
    **/
    chunks: Uint8Array | CborBytes[];

    get isDefiniteLength()
    {
        return this.chunks instanceof Uint8Array;
    }

    addInfos: number;
    
    constructor(
        bytes: Uint8Array | CborBytes[],
        addInfos?: number,
    )
    {
        this.chunks = bytes;
        this.addInfos = addInfos ?? headerFollowingToAddInfos( this.bytes.length );
    }

    toRawObj(): RawCborBytes
    {
        return {
            bytes: Uint8Array.prototype.slice.call( this.bytes )
        };
    }

    clone(): CborBytes
    {
        return new CborBytes(
            this.chunks,
            this.addInfos
        );
    }
}

function concatBytes( fst: Uint8Array, rest: Uint8Array[] ): Uint8Array
{
    // pre allocate resulting byte
    const result = new Uint8Array( rest.reduce<number>( (a,b) => a + b.length, fst.length ) );
    let offset = fst.length;
    result.set( fst, 0 ); // copy first
    let elem: Uint8Array;
    for( let i = 0; i < rest.length; i++ )
    {
        elem = rest[i];
        result.set( elem, offset ); // copy ith
        offset += elem.length;
    }
    return result;
}