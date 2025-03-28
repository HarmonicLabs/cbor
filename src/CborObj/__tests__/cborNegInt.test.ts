import { Cbor } from "../../Cbor";
import { CborNegInt } from "../CborNegInt";

describe("neg int", () => {

    test("remembers 1 bytes header", () => {

        const str = "20";
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 2 bytes header", () => {

        const str = "3800";
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 3 bytes header", () => {

        const str = "390000";
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 5 bytes header", () => {
            
        const str = "3a00000000".toLowerCase();
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );

    });

    test("remembers 9 bytes header", () => {

        const str = "3B0000000000000000".toLowerCase();
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
        
    });

    test("remembers 10 byte bignum", () => {

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums 
        const str = "c34a00000000000000000000"; 
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
    });

    test("remembers 10 byte bignum max", () => {

        // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums 
        const str = "c34affffffffffffffffffff"; 
        const parsed = Cbor.parse( str ) as CborNegInt;

        expect( parsed instanceof CborNegInt ).toBe( true );
        expect( parsed.num ).toEqual( BigInt(-1) - BigInt( "0xffffffffffffffffffff" ) );

        expect(
            Cbor.encode( parsed ).toString()
        ).toEqual( str );
    });

    describe("bigNum", () => {

        function testN( n: number | bigint )
        {
            test(n.toString(), () => {
                expect(() => CborNegInt.bigNum( n )).not.toThrow();
            });
        }

        testN( -1 );
        testN( -1n );
        testN( -0x10000000000000000n );
        testN( -0x10000000000000000000000000000000n );
    })

});