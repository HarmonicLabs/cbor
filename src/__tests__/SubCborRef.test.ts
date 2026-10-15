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
/**
 * a parsed tag keeps the bytes it came from, like every other parsed
 * object (it used to be the only one without a `subCborRef`, so callers
 * that keep source bytes, e.g. decoded Plutus Data `d87981 01`, had to
 * re-encode tags; node-diversity-conformance item 584)
 */
describe("SubCborRef on tags", () => {

    test.each([
        "d87980",
        "d8798101",
        "d9007a8101",           // non-minimal tag head
        "d866820080",
        "c11a5f5e1000",
        "d81843a10000",
    ])( "%s", hex => {
        const parsed = Cbor.parse( hex );
        expect( parsed.subCborRef instanceof SubCborRef ).toBe( true );
        expect( toHex( parsed.subCborRef!.toBuffer() ) ).toEqual( hex );
    });

    test("nested tag", () => {
        const hex = "82" + "01" + "d8799f0102ff";
        const parsed = Cbor.parse( hex ) as CborArray;
        const tag = parsed.array[1];
        expect( toHex( tag.subCborRef!.toBuffer() ) ).toEqual( "d8799f0102ff" );
    });

    test("not kept without keepRef", () => {
        expect( Cbor.parse( "d87980", { keepRef: false } ).subCborRef ).toBeUndefined();
    });
});
