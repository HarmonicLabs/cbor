import { CborObj, isCborObj, isRawCborObj, RawCborObj } from "./CborObj"
import { ToRawObj } from "./interfaces/ToRawObj"
import { Cloneable } from "../utils/Cloneable";
import { canBeUInteger } from "../utils/ints";
import { assert } from "../utils/assert";
import { isObject } from "@harmoniclabs/obj-utils";

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

export interface CborTagMetadata {
    containingTag: number
}

export function isCborUIntMetadata( stuff: any ): stuff is CborTagMetadata
{
    return (
        isObject( stuff ) &&
        typeof stuff.containingTag === "number"
    );
}

export function cloneCborUIntMetadata( meta: CborTagMetadata ): CborTagMetadata
{
    return {
        containingTag: meta.containingTag
    };
}

export class CborTag
    implements ToRawObj, Cloneable<CborTag>
{
    private readonly _tag: bigint
    get tag(): bigint
    {
        return this._tag
    }

    private readonly _data: CborObj
    get data(): CborObj
    {
        return this._data
    }

    private readonly _metadata: CborTagMetadata | undefined
    get metadata(): CborTagMetadata | undefined
    {
        return this._metadata
    }

    constructor( tag: number | bigint , data: CborObj, metadata?: CborTagMetadata )
    {
        if( typeof tag === "number" ) tag = BigInt( tag );

        assert(
            typeof tag === "bigint" &&
            isCborObj( data ),
            "using direct value constructor; either 'tag' is not a number or 'data' is missing"
        );

        this._tag = tag;
        this._data = data;
        this._metadata = metadata;
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
        return new CborTag( this.tag, this.data.clone() )
    }
}
