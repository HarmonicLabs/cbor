import { toHex } from "@harmoniclabs/uint8array-utils";
import { Cloneable } from "./utils/Cloneable";

export interface ISubCborRef {
    _bytes: Uint8Array;
    start: number;
    end: number;
}

export class SubCborRef
    implements ISubCborRef, Cloneable<SubCborRef>
{
    _bytes: Uint8Array;
    start: number;
    end: number;

    constructor({ _bytes, start, end }: ISubCborRef)
    {
        // super might have cloned `_bytes`, but in `SubCborRef` we want to keep the reference
        this._bytes = _bytes;
        this.start = start;
        this.end = end;
    }

    toString(): string
    {
        return toHex( this.toBuffer() )
    }

    toBuffer(): Uint8Array
    {
        return Uint8Array.prototype.slice.call( this._bytes, this.start, this.end );    
    }

    clone(): SubCborRef
    {
        return new SubCborRef({
            _bytes: this._bytes, // DO NO CLONE BYTES
            start: this.start,
            end: this.end
        });
    }
}