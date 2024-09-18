import { ToRawObj } from "./interfaces/ToRawObj";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";

type SimpleValue = boolean | undefined | null | number;

export function isSimpleCborValue( v: SimpleValue ): v is SimpleValue
{
    const t = typeof v;

    return (
        v === null          ||
        t === "boolean"     ||
        t === "undefined"   ||
        t === "number"
    );
}

type SimpleNumAs = "float" | "simple"

export type RawCborSimple = {
    simple: SimpleValue
}

export function isRawCborSimple( s: RawCborSimple ): boolean
{
    if( typeof s !== "object" || s === null ) return false;

    const keys = Object.keys( s );

    return (
        keys.includes("simple") &&
        isSimpleCborValue( s.simple )
    );
}

export class CborSimple
    implements ToRawObj, Cloneable<CborSimple>
{
    private readonly _simple: SimpleValue;
    get simple(): SimpleValue
    {
        return this._simple;
    }

    private readonly _numAs: SimpleNumAs;
    get numAs(): SimpleNumAs
    {
        return this._numAs;
    }

    constructor( simple: SimpleValue, interpretNumAs?: SimpleNumAs )
    {
        if(
            interpretNumAs === undefined     &&
            typeof simple === "number"       &&
            simple >= 0 && simple <= 255 &&
            simple === Math.round( simple )
        ) interpretNumAs = "simple";

        if( interpretNumAs === undefined ) interpretNumAs = "float";

        if( interpretNumAs === "simple" )
        {
            assert(
                typeof simple === "number" &&
                simple >= 0 && simple <= 255 &&
                simple === Math.round( simple ),
                "invalid simple value"
            );
        }

        assert(
            isSimpleCborValue( simple ),
            "invalid cbor simple value; received: " + simple
        );

        this._simple = simple;
        this._numAs = interpretNumAs;
    }

    toRawObj(): RawCborSimple
    {
        return {
            simple: this.simple
        };
    }

    clone(): CborSimple
    {
        return new CborSimple( this.simple, this.numAs );
    }

    static get null(): CborSimple
    {
        return new CborSimple( null );
    }
    static get true(): CborSimple
    {
        return new CborSimple( true );
    }
    static get false(): CborSimple
    {
        return new CborSimple( false );
    }
    static get undefined(): CborSimple
    {
        return new CborSimple( undefined );
    }
    static simple( n: number ): CborSimple
    {
        if( typeof n !== "number" ) n = 0;
        return new CborSimple( n, "simple" );
    }
    static float( n: number ): CborSimple
    {
        if( typeof n !== "number" ) n = 0;
        return new CborSimple( n, "float" );
    }
}
