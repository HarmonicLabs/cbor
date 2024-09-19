import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

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

export interface CborBytesMetadata {
    headerAddInfos: number
    headerFollowingBytes: Uint8Array
}

export function isCborBytesMetadata( stuff: any ): stuff is CborBytesMetadata
{
    return (
        isObject( stuff ) &&
        typeof stuff.headerAddInfos === "number" &&
        isUint8Array( stuff.headerFollowingBytes )
    );
}

export function cloneCborBytesMetadata( meta: CborBytesMetadata ): CborBytesMetadata
{
    return {
        headerAddInfos: meta.headerAddInfos,
        headerFollowingBytes: Uint8Array.prototype.slice.call( meta.headerFollowingBytes )
    };
}

export class CborBytes
    implements ToRawObj, Cloneable<CborBytes>
{
    /** @deprecated use `bytes` instead */
    get buffer(): Uint8Array { 
        return this.bytes; 
    }

    private readonly _bytes: Uint8Array;
    /**
     * if the bytes were of definite length this just wraps the `bytes`
     * property in a single element array
     * 
     * if the bytes were of indefinite length this array has more than one element
    **/
    get bytes(): Uint8Array
    {
        return this._bytes;
    }

    private readonly _chunks: Uint8Array[];
    get chunks(): Uint8Array[]
    {
        return this._chunks;
    }

    private readonly _restChunks: Uint8Array[] | undefined;
    get restChunks(): Uint8Array[] | undefined
    {
        return this._restChunks;
    }

    private readonly _isDefiniteLength: boolean;
    get isDefiniteLength(): boolean
    {
        return this._isDefiniteLength;
    }

    private readonly _metadata: CborBytesMetadata | undefined;
    get metadata(): CborBytesMetadata | undefined
    {
        return this._metadata;
    }
    
    constructor(
        bytes: Uint8Array,
        restChunks: Uint8Array[] | undefined = undefined,
        metadata?: CborBytesMetadata
    )
    {
        assert(
            isUint8Array( bytes ),
            "invalid buffer in CborBytes"
        );

        const _originalRestWasEmptyArray = Array.isArray( restChunks ) && restChunks.length === 0;
        
        restChunks = Array.isArray( restChunks ) ? restChunks.slice() : [];
        restChunks = restChunks.filter(( chunk ) => ( chunk instanceof Uint8Array ));

        this._isDefiniteLength = (!_originalRestWasEmptyArray) && restChunks.length === 0;

        this._restChunks = this.isDefiniteLength ? restChunks : undefined;
        this._bytes = this.isDefiniteLength ? bytes : concatBytes( bytes, ( this.restChunks ?? [] ) );
        this._chunks = this.isDefiniteLength ? [ this.bytes ] : [ this.bytes, ...( this.restChunks ?? [] ) ];

        this._metadata = undefined;

        if( isCborBytesMetadata( metadata ) )
        {
            this._metadata = cloneCborBytesMetadata( metadata );
        }
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
            rest.map(( chunk ) => ( Uint8Array.prototype.slice.call( chunk ) ))
        );
    }
}

function concatBytes( fst: Uint8Array, rest: Uint8Array[] ): Uint8Array
{
    // pre allocate resulting byte
    const result = new Uint8Array( rest.reduce<number>(( a, b ) => a + b.length, fst.length ) );
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
