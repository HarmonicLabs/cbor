import { fromHex } from "@harmoniclabs/uint8array-utils";
import { Cbor } from "../../Cbor";
import { CborBytes } from "../CborBytes";
import { CborTag } from "../CborTag";
import { CborUInt } from "../CborUInt";

describe("uint", () => {

    test("has num", () => {

        const parsed = Cbor.parse("1801") as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );
    })

    test("remembers 1 bytes header", () => {

        const str = "01";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 2 bytes header", () => {

        const str = "1801";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 3 bytes header", () => {

        const str = "190001";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 5 bytes header", () => {
            
        const str = "1A00000001".toLowerCase();
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 9 bytes header", () => {

        const str = "1B0000000000000001".toLowerCase();
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
        
    });

    test("remembers 10 byte bignum", () => {

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums 
        const str = "c24a00000000000000000001";
        const parsed = Cbor.parse( str ) as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
    });

});