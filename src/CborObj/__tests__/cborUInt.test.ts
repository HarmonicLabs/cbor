import { CborUInt } from "../CborUInt";
import { Cbor } from "../../Cbor";

describe("uint", () => {

    test("remembers 1 bytes header", () => {

        const str = "01";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 2 bytes header", () => {

        const str = "1801";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 3 bytes header", () => {

        const str = "190001";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 5 bytes header", () => {
            
        const str = "1A00000001".toLowerCase();
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 9 bytes header", () => {

        const str = "1B0000000000000001".toLowerCase();
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
        
    });

    test.only("remembers 10 byte bignum", () => {

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums 
        const str = "c24a00000000000000000001";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed instanceof CborUInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
    });

});