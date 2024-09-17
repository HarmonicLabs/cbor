import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

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
    implements ToRawObj, Cloneable<CborText>
{
    private readonly _text : string;
    get text(): string
    {
        return this._text;
    }
    
    constructor( text: string )
    {
        assert(
            typeof text === "string",
            "invalid text in 'CborText' passed"
        );

        this._text = text;
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
