import { CborPositiveRational } from "..";

describe("CborPostiveRational", () => {

    describe("fromNumber", () => {

        test("toNumber identity", () => {

            function testId( n : number )
            {
                const rational = CborPositiveRational.fromNumber( n );
                expect( rational.toNumber() ).toEqual( n );
            }

            testId( 1 );
            testId( 2.5 );
            testId( Math.PI );
            testId( Math.E );

            testId( 0.0577 );
            testId( 0.0000721 );

        });

    })
})
import { Cbor } from "../../Cbor";
import { CborTag } from "../../CborObj/CborTag";
import { toHex } from "@harmoniclabs/uint8array-utils";

/**
 * only tag 30 is a rational (node-diversity-conformance item 576:
 * `d81f820102`, tag 31, was read as 1/2 and re-encoded with tag 30)
 */
describe("CborPositiveRational tag check", () => {

    test.each([
        [ "d81e820102", 1n, 2n, "d81e820102" ],
        [ "d81e820100", 1n, 0n, "d81e820100" ],   // denominator checks belong to the caller
        [ "d81e9f0102ff", 1n, 2n, "d81e820102" ], // fresh encoding
    ])( "%s is a rational", ( hex, num, den, encoded ) => {
        const cObj = Cbor.parse( hex );
        for( const r of [ CborPositiveRational.fromCborObjOrUndef( cObj )!, CborPositiveRational.fromCborObj( cObj ) ] )
        {
            expect( r instanceof CborPositiveRational ).toBe( true );
            expect( r.num ).toEqual( num );
            expect( r.den ).toEqual( den );
            expect( r.tag ).toEqual( 30n );
        }
        expect( toHex( Cbor.encode( CborPositiveRational.fromCborObj( cObj ) ) ) ).toEqual( encoded );
    });

    test.each([
        "d81f820102",   // tag 31
        "d818820102",   // tag 24
        "c2820102",     // tag 2 over an array
        "820102",       // untagged
        "d81e83010203", // three elements
        "d81e8101",     // one element
        "d81e822001",   // negative numerator
        "d81e8201f6",   // null denominator
    ])( "%s is not a rational", hex => {
        const cObj = Cbor.parse( hex );
        expect( CborPositiveRational.fromCborObjOrUndef( cObj ) ).toBeUndefined();
        expect( () => CborPositiveRational.fromCborObj( cObj ) ).toThrow();
    });

    test("undefined input", () => {
        expect( CborPositiveRational.fromCborObjOrUndef( undefined ) ).toBeUndefined();
        expect( CborPositiveRational.fromCborObjOrUndef( new CborTag( 30, Cbor.parse( "820102" ) ) ) ).toBeDefined();
    });
});
