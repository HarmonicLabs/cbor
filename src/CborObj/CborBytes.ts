import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";

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

export interface CborBytesMeatadata {
    headerAddInfos: number // 24
    headerFollowingBytes: Uint8Array // [0x01]
}

export class CborBytes
    implements ToRawObj, Cloneable<CborBytes>
{
    /** @deprecated use `bytes` instead */
    get buffer(): Uint8Array { return this.bytes; }
    readonly bytes: Uint8Array;
    /**
     * if the bytes where of definite length this just wraps the `bytes`
     * property in a single element array
     * 
     * if the bytes where of indefinite length this array has more than one element
    **/
    readonly chunks: Uint8Array[];

    readonly isDefiniteLength: boolean

    readonly meta
    
    constructor( bytes: Uint8Array, restChunks: Uint8Array[] | undefined = undefined )
    {
        assert(
            isUint8Array( bytes ),
            "invalid buffer in CborBytes"
        );

        const _originalRestWasEmptyArray = Array.isArray( restChunks ) && restChunks.length === 0;
        
        restChunks = Array.isArray( restChunks ) ? restChunks.slice() : [];
        restChunks = restChunks.filter( chunk => chunk instanceof Uint8Array );

        const _isDefiniteLength = (!_originalRestWasEmptyArray) && restChunks.length === 0;

        Object.defineProperties(
            this, {
                bytes: {
                    get: _isDefiniteLength ? () => bytes : () => concatBytes( bytes, (restChunks ?? []) ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                chunks: {
                    value: Object.freeze( _isDefiniteLength ? [ bytes ] : [ bytes, ...(restChunks ?? []) ] ),
                    writable: false,
                    enumerable: true,
                    configurable: false
                },
                isDefiniteLength: {
                    value: _isDefiniteLength,
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            }
        );
    }

    toRawObj(): RawCborBytes
    {
        return {
            bytes: Uint8Array.prototype.slice.call( this.bytes )
        };
    }

    clone(): CborBytes
    {
        if( this.isDefiniteLength )
        return new CborBytes(
            Uint8Array.prototype.slice.call( this.bytes )
        );
        
        const [ bytes, ...rest ] = this.chunks;

        return new CborBytes(
            Uint8Array.prototype.slice.call( bytes ),
            rest.map( chunk => Uint8Array.prototype.slice.call( chunk ) )
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