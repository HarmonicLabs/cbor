import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from "./CborObj";
import { ToRawObj } from "./interfaces/ToRawObj";
import { assert } from "../utils/assert";
import { ICborObj } from "./interfaces/ICborObj";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";
import { SubCborRef } from "../SubCborRef";

export interface CborArrayOptions {
    indefinite?: boolean,
    addInfos?: number | undefined
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
    indefinite: false,
    addInfos: 0
});

export class CborArray
    implements ToRawObj, Cloneable<CborArray>, ICborObj
{
    readonly array: CborObj[];
    readonly indefinite!: boolean;

    addInfos: number;
    
    constructor(
        array: CborObj[],
        options?: CborArrayOptions,
        public subCborRef?: SubCborRef
    )
    {
        assert(
            Array.isArray( array ) &&
            array.every( isCborObj ),
            "in 'CborArray' constructor: invalid input; got: " + array
        );

        const indefinite = options?.indefinite === true ? true : defaultOpts.indefinite;
        this.addInfos = options?.addInfos ?? headerFollowingToAddInfos( array.length );
        this.array = array;
        this.indefinite = indefinite === true;
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
            this.array.map( elem => elem.clone() ),
            { indefinite: this.indefinite, addInfos: this.addInfos },
            this.subCborRef?.clone()
        );
    }
}
