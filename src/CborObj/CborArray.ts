import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from "./CborObj";
import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

export interface CborArrayOptions {
    indefinite?: boolean
}

export type RawCborArray = {
    array: RawCborObj[]
    options?: CborArrayOptions
}

export function isRawCborArray( arr: RawCborArray ): boolean
{
    if( typeof arr !== "object" ) return false;

    const keys = Object.keys( arr );

    return (
        keys.includes("array") &&
        Array.isArray( arr.array ) &&
        arr.array.every( isRawCborObj )
    );
}

const defaultOpts: Required<CborArrayOptions> = Object.freeze({
    indefinite: false
});

export class CborArray
    implements ToRawObj, Cloneable<CborArray>
{
    readonly array: CborObj[];
    readonly indefinite!: boolean;
    
    constructor( array: CborObj[], options?: CborArrayOptions )
    {
        assert(
            Array.isArray( array ) &&
            array.every( isCborObj ),
            "in 'CborArray' constructor: invalid input; got: " + array
        );

        const indefinite = options?.indefinite === true ? true : defaultOpts.indefinite;

        this.array = array;
        this.indefinite = indefinite;
    }

    toRawObj(): RawCborArray
    {
        return {
            array: this.array.map( cborObj => cborObj.toRawObj() ),
            options: this.indefinite === true ? {
                indefinite: this.indefinite
            } : undefined
        };
    }

    clone(): CborArray
    {
        return new CborArray(
            this.array,
            { indefinite: this.indefinite }
        );
    }
}
