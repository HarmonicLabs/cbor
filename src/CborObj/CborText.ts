import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { ToRawObj } from "./interfaces/ToRawObj";
import { ICborObj } from "./interfaces/ICborObj";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";

export type RawCborText = {
    text: string
}

export function isRawCborText( t: RawCborText ): boolean
{
    if( typeof t !== "object" || t === null ) return false;

    const keys = Object.keys( t );

    return (
        keys.includes("text") &&
        typeof t.text === "string"
    );
}

export class CborText
    implements ToRawObj, Cloneable<CborText>, ICborObj
{
    get text(): string
    {
        if( typeof this.chunks === "string" ) return this.chunks;

        return this.chunks.reduce( ( accum, chunk ) => accum + chunk.text, "" );
    }

    chunks: string | CborText[];
    
    get isDefiniteLength()
    {
        return typeof this.chunks === "string";
    }

    addInfos: number;

    constructor(
        text: string | CborText[],
        addInfos?: number,
    )
    {
        this.chunks = text;
        this.addInfos = addInfos ?? headerFollowingToAddInfos( text.length )
    }

    toRawObj(): RawCborText
    {
        return {
            text: this.text
        };
    }

    clone(): CborText
    {
        return new CborText( this.text );
    }
}