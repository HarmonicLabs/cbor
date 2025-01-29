import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { Cbor } from "../Cbor";
import { CborArray } from "../CborObj";
import { SubCborRef } from "../SubCborRef";

describe("SubCborRef", () => {

    test("mutexo lock", () => {
        const hex = "83011aef0b922481828303825820a37f9041b1ce58e9800eedd68c286bc881cff6aab34d1f804ad7ffc877c2412d00583900017aaadbf975d56ea7bf40d3a716e5ab23b726878d5979fb454af084e48b953abaa4445ae75bf9c8f4f790da9adf795aa34c0cf9fd75b34200";
        const bytes = fromHex( hex );
        let parsed = Cbor.parse( bytes );

        expect( parsed instanceof CborArray ).toBe( true );
        const topRef = parsed.subCborRef;
        expect( topRef instanceof SubCborRef ).toBe( true );
        expect( (parsed as CborArray).array[2] instanceof CborArray ).toBe( true );
        parsed = (parsed as CborArray).array[2] as CborArray;
        const subRef = parsed.subCborRef;
        expect( subRef instanceof SubCborRef ).toBe( true );
        expect( parsed.array.length ).toBe( 1 );
        const elem = parsed.array[0];
    });
    
});