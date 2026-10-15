import { Cbor } from "..";
import { CborUInt } from "../../CborObj/CborUInt";
import { CborNegInt } from "../../CborObj/CborNegInt";
import { CborArray } from "../../CborObj/CborArray";
import { CborBytes } from "../../CborObj/CborBytes";
import { toHex } from "@harmoniclabs/uint8array-utils";

/**
 * `isBigNum` keeps the origin of a parsed integer: a `#6.2` / `#6.3` bignum
 * and a plain head decode to the same `CborUInt` / `CborNegInt` class, but
 * cardano-ledger accepts bignums only inside Plutus Data, so decoders of
 * fixed-width fields need to tell them apart (node-diversity-conformance
 * item 572).
 */
describe("isBigNum", () => {

    test.each([
        // hex, expected class, expected value
        [ "c24101", CborUInt, 1n ],
        [ "c24100", CborUInt, 0n ],
        [ "c2420001", CborUInt, 1n ],
        [ "c249010000000000000000", CborUInt, 1n << 64n ],
        [ "c34100", CborNegInt, -1n ],
        [ "c34101", CborNegInt, -2n ],
        [ "c349010000000000000000", CborNegInt, -(1n << 64n) - 1n ],
    ] as const)( "parsed bignum %s has isBigNum = true", ( hex, Cls, value ) => {
        const parsed = Cbor.parse( hex ) as CborUInt | CborNegInt;
        expect( parsed instanceof Cls ).toBe( true );
        expect( parsed.isBigNum ).toBe( true );
        expect( parsed.num ).toEqual( value );
        // encoding unchanged: the bignum form is written back
        expect( toHex( Cbor.encode( parsed ) ) ).toEqual( hex );
    });

    test.each([
        [ "00", 0n ],
        [ "01", 1n ],
        [ "1864", 100n ],
        [ "1bffffffffffffffff", (1n << 64n) - 1n ],
        [ "20", -1n ],
        [ "3bffffffffffffffff", -(1n << 64n) ],
    ])( "parsed head %s has isBigNum = false", ( hex, value ) => {
        const parsed = Cbor.parse( hex ) as CborUInt | CborNegInt;
        expect( parsed.isBigNum ).toBe( false );
        expect( parsed.num ).toEqual( value );
        expect( toHex( Cbor.encode( parsed ) ) ).toEqual( hex );
    });

    test("parseWithOffset sets it on nested elements", () => {
        const { parsed, offset } = Cbor.parseWithOffset( "8301c2410120" );
        expect( offset ).toBe( 6 );
        const arr = ( parsed as CborArray ).array as ( CborUInt | CborNegInt )[];
        expect( arr.map( x => x.isBigNum ) ).toEqual([ false, true, false ]);
    });

    test("is a read-only boolean property", () => {
        const parsed = Cbor.parse( "c24101" ) as CborUInt;
        expect( typeof parsed.isBigNum ).toBe( "boolean" );
        expect( () => { ( parsed as any ).isBigNum = false; } ).toThrow();
        expect( parsed.isBigNum ).toBe( true );
    });

    test("constructed values", () => {
        expect( new CborUInt( 1 ).isBigNum ).toBe( false );
        expect( new CborNegInt( -1 ).isBigNum ).toBe( false );
        expect( new CborUInt( 1n << 64n ).isBigNum ).toBe( true );
        expect( new CborNegInt( -(1n << 64n) - 1n ).isBigNum ).toBe( true );
        expect( CborUInt.bigNum( 1 ).isBigNum ).toBe( true );
        expect( CborNegInt.bigNum( -1 ).isBigNum ).toBe( true );
        expect( new CborUInt( 1, 0, new CborBytes( new Uint8Array([ 1 ]) ) ).isBigNum ).toBe( true );
    });

    test("clone keeps it", () => {
        expect( ( Cbor.parse( "c24101" ) as CborUInt ).clone().isBigNum ).toBe( true );
        expect( ( Cbor.parse( "01" ) as CborUInt ).clone().isBigNum ).toBe( false );
        expect( ( Cbor.parse( "c34101" ) as CborNegInt ).clone().isBigNum ).toBe( true );
    });
});
