import { toHex } from "@harmoniclabs/uint8array-utils";
import { CborString } from "./CborString";
import { Cloneable } from "./utils/Cloneable";
import { ByteString } from "@harmoniclabs/bytestring";

export interface ISubCborRef {
    _bytes: Uint8Array;
    start: number;
    end: number;
}

export class SubCborRef extends CborString
    implements ISubCborRef, Cloneable<SubCborRef>
{
    _bytes: Uint8Array;
    start: number;
    end: number;

    constructor({ _bytes, start, end }: ISubCborRef)
    {
        super( _bytes );
    }

    override toString(): string
    {
        return toHex( this.toBuffer() )
    }

    override toBuffer(): Uint8Array
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