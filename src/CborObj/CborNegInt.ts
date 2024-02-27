import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { ToRawObj } from "./interfaces/ToRawObj";

export type RawCborNegInt = {
    neg: bigint
}

export function isRawCborNegative( neg: RawCborNegInt ): boolean
{
    if( typeof neg !== "object" || neg === null ) return false;
    
    const keys = Object.keys( neg );

    return (
        keys.includes("neg")  &&
        typeof neg.neg === "bigint" &&
        neg.neg < 0
    );
}

export class CborNegInt
    implements ToRawObj, Cloneable<CborNegInt>
{
    readonly num : bigint;
    
    constructor( neg: number | bigint )
    {
        if( typeof neg === "number" ) neg = BigInt( neg );

        assert(
            typeof neg === "bigint" &&
            neg < BigInt( 0 ),
            "neg CBOR numbers must be less than 0; got: " + neg
        );
        
        defineReadOnlyProperty(
            this, "num", neg
        );
    }

    toRawObj(): RawCborNegInt
    {
        return {
            neg: this.num
        };
    }

    clone(): CborNegInt
    {
        return new CborNegInt( this.num );
    }
}