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

export class CborBytes
    implements ToRawObj, Cloneable<CborBytes>
{
    /** @deprecated use `bytes` instead */
    get buffer(): Uint8Array { return this.bytes; }
    readonly bytes: Uint8Array;
    
    constructor( bytes: Uint8Array )
    {
        assert(
            isUint8Array( bytes ),
            "invalid buffer in CborBytes"
        );

        defineReadOnlyProperty(
            // if `slice` is removed here update `clone` method
            this, "bytes", Uint8Array.prototype.slice.call( bytes )
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
        // `this.bytes` cloned in constructor
        return new CborBytes( this.bytes );
    }
}
