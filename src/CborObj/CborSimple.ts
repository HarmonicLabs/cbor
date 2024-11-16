import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Cloneable } from "../utils/Cloneable";
import { assert } from "../utils/assert";
import { ToRawObj } from "./interfaces/ToRawObj";
import { SubCborRef } from "../SubCborRef";

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
    readonly simple: SimpleValue;
    readonly numAs: SimpleNumAs;

    constructor(
        simple: SimpleValue,
        interpretNumAs?: SimpleNumAs,
        public subCborRef?: SubCborRef
    )
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

        defineReadOnlyProperty(
            this, "simple", simple
        );
        defineReadOnlyProperty(
            this, "numAs", interpretNumAs
        );
    }

    toRawObj(): RawCborSimple
    {
        return {
            simple: this.simple
        };
    }

    clone(): CborSimple
    {
        return new CborSimple(
            this.simple,
            this.numAs,
            this.subCborRef?.clone()
        );
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
    static simpleNumber( n: number ): CborSimple
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