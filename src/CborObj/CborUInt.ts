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

export class CborUInt
    implements ToRawObj, Cloneable<CborUInt>
{
    private readonly _num : bigint;
    get num(): bigint
    {
        return this._num;
    }
    
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

        this._num = uint;
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
