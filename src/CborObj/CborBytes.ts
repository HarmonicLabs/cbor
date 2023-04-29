import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

export type RawCborBytes = {
    bytes: Uint8Array
}

export function isRawCborBytes( b: RawCborBytes ): boolean
{
    if( typeof b !== "object" ) return false;
    
    const keys = Object.keys( b );

    return (
        keys.length === 1 &&
        keys[0] === "bytes"  &&
        isUint8Array( b.bytes )
    );
}

export class CborBytes
    implements ToRawObj, Cloneable<CborBytes>
{
    private _buff : Uint8Array;
    get buffer(): Uint8Array { return this._buff.slice() }
    
    constructor( bytes: Uint8Array )
    {
        assert(
            isUint8Array(bytes),
            "invalid buffer in CborBytes"
        );

        this._buff = bytes;
    }

    toRawObj(): RawCborBytes
    {
        return {
            bytes: this.buffer
        };
    }

    clone(): CborBytes
    {
        return new CborBytes( this._buff.slice() );
    }
}
