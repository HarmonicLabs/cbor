import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { canBeUInteger } from "../utils/ints";
import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from "./CborObj"
import { ToRawObj } from "./interfaces/ToRawObj"
import { SubCborRef } from "../SubCborRef";

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

    constructor(
        tag: number | bigint,
        data: CborObj,
        public subCborRef?: SubCborRef
    )
    {
        if( typeof tag === "number" ) tag = BigInt( tag );

        assert(
            typeof tag === "bigint" &&
            isCborObj( data ),
            "using direct value constructor; either 'tag' is not a number or 'data' is missing"
        );

        defineReadOnlyProperty(
            this, "tag", tag
        );
        defineReadOnlyProperty(
            this, "data", data
        )
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
            this.subCborRef?.clone()
        );
    }
}