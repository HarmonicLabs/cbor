import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { ToRawObj } from "./interfaces/ToRawObj";

export type RawCborUInt = {
    uint: bigint
}

export function isRawCborUnsigned( unsign: RawCborUInt ): boolean
{
    if( typeof unsign !== "object" ) return false;
    
    const keys = Object.keys( unsign );

    return (
        keys.length === 1 &&
        keys[0] === "uint"  &&
        typeof unsign.uint === "bigint" &&
        unsign.uint >= 0
    );
}

export class CborUInt
    implements ToRawObj, Cloneable<CborUInt>
{
    private _unsigned : bigint;
    get num(): bigint { return this._unsigned }
    
    constructor( uint: number | bigint )
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

        this._unsigned = uint;
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