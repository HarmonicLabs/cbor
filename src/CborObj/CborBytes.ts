import { isUint8Array } from "@harmoniclabs/uint8array-utils";
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
    
    constructor( bytes: Uint8Array, restChunks: Uint8Array[] | undefined = undefined )
    {
        assert(
            isUint8Array( bytes ),
            "invalid buffer in CborBytes"
        );

        const _originalRestWasEmptyArray = Array.isArray( restChunks ) && restChunks.length === 0;
        
        restChunks = Array.isArray( restChunks ) ? restChunks.slice() : [];
        restChunks = restChunks.filter(( chunk ) => ( chunk instanceof Uint8Array ));

        this._isDefiniteLength = (!_originalRestWasEmptyArray) && restChunks.length === 0;

        const lengthTot = this.isDefiniteLength ? bytes.length : bytes.length + restChunks.reduce<number>(( a, b ) => a + b.length, 0 );

        const headByte = addHeadByte(lengthTot);
        const updatedBytes = new Uint8Array(headByte.length + bytes.length);
        updatedBytes.set(headByte, 0);
        updatedBytes.set(bytes, headByte.length);

        this._restChunks = this.isDefiniteLength ? restChunks : undefined;
        this._bytes = this.isDefiniteLength ? updatedBytes : concatBytes( updatedBytes, ( this.restChunks ?? [] ) );
        this._chunks = this.isDefiniteLength ? [ this.bytes ] : [ this.bytes, ...( this.restChunks ?? [] ) ];
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

    static decode( bytes: CborBytes ): Uint8Array
    {
        // TODO
        return new Uint8Array();
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

function addHeadByte( lengthTot: number ): Uint8Array
{
    if( lengthTot < 24 )
    {
        const baseValue = 0x40;                                                         // 0b010_00000
        const headByte = baseValue + lengthTot;
        return new Uint8Array([ headByte ]);                                            // from 0x40 to 0x57
    }
    else if( lengthTot === 24 ) return new Uint8Array([ 0x58 ]);                        // 0b010_11000  (1 more byte follows)
    else if( lengthTot === 25 ) return new Uint8Array([ 0x59 ]);                        // 0b010_11001  (2 more bytes follow)
    else if( lengthTot === 26 ) return new Uint8Array([ 0x5A ]);                        // 0b010_11010  (4 more bytes follow)
    else if( lengthTot === 27 ) return new Uint8Array([ 0x5B ]);                        // 0b010_11011  (8 more bytes follow)
    else if( lengthTot === 31 ) return new Uint8Array([ 0x5F ]);                        // 0b010_11111  (follow bytes 'till break tag)
    else throw new Error( "values between 28 and 30 are reserved for future uses" );    // from 0x5C to 0x5E
}
