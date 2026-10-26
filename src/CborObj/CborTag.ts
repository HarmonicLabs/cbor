import { Cloneable } from "../utils/Cloneable";

import { canBeUInteger } from "../utils/ints";
import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from "./CborObj"
import { ToRawObj } from "./interfaces/ToRawObj"
import { SubCborRef } from "../SubCborRef";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";

export type RawCborTag = {
    tag: number | bigint,
    data: RawCborObj
}

export function isRawCborTag( t: RawCborTag ): boolean
{
    if( typeof t !== "object" || t === null ) return false;

    const keys = Object.keys( t );

    return (
        keys.includes( "tag" ) &&
        keys.includes( "data" ) &&
        canBeUInteger( t.tag ) &&
        isRawCborObj( t.data )
    );
}

export class CborTag
    implements ToRawObj, Cloneable<CborTag>
{
    readonly tag: bigint

    readonly data: CborObj

    /**
     * additional info of the tag head (24..27 select a 1, 2, 4 or 8 byte
     * tag number); kept from the source so that a non-minimal head such as
     * `d9 0079` re-encodes as it came. Defaults to the minimal head.
     */
    addInfos: number;

    constructor(
        tag: number | bigint,
        data: CborObj,
        public subCborRef?: SubCborRef,
        addInfos?: number
    )
    {
        if( typeof tag === "number" ) tag = BigInt( tag );

        if(!(
            typeof tag === "bigint" &&
            isCborObj( data )
        )) throw new Error(
            "using direct value constructor; either 'tag' is not a number or 'data' is missing"
        );

        this.tag = tag;
        this.data = data;
        this.addInfos = addInfos ?? headerFollowingToAddInfos( tag );
    }

    toRawObj(): RawCborTag
    {
        return {
            tag: this.tag,
            data: this.data.toRawObj(),
        }
    }

    clone(): CborTag
    {
        return new CborTag(
            this.tag,
            this.data.clone(),
            this.subCborRef?.clone(),
            this.addInfos
        );
    }
}