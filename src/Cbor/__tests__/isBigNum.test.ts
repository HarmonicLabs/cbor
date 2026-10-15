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

/**
 * An empty magnitude is a valid bignum (RFC 8949 §3.4.3: the byte string
 * is the big-endian value, so zero bytes is 0); cardano-ledger accepts
 * `c240` as Plutus Data integer 0 (node-diversity-conformance item 583).
 */
describe("empty bignum magnitude", () => {

    test.each([
        [ "c240", 0n ],
        [ "c340", -1n ],
        [ "c25f40ff", 0n ],   // chunked, one empty chunk
        [ "c35fff", -1n ],    // chunked, no chunks
        [ "82c24001", null ],
    ])( "%s decodes", ( hex, value ) => {
        const parsed = Cbor.parse( hex );
        if( value !== null )
        {
            const n = parsed as CborUInt | CborNegInt;
            expect( n.isBigNum ).toBe( true );
            expect( n.num ).toEqual( value );
            expect( n.clone().num ).toEqual( value );
        }
        // the empty magnitude is written back as it came
        expect( toHex( Cbor.encode( parsed ) ) ).toEqual( hex );
    });

    test("bigNum factories", () => {
        expect( CborUInt.bigNum( new CborBytes( new Uint8Array( 0 ) ) ).num ).toEqual( 0n );
        expect( CborNegInt.bigNum( new CborBytes( new Uint8Array( 0 ) ) ).num ).toEqual( -1n );
        expect( CborUInt.bigNum( new CborBytes( new Uint8Array([ 0, 0, 5 ]) ) ).num ).toEqual( 5n );
        expect( CborNegInt.bigNum( new CborBytes( new Uint8Array([ 0, 5 ]) ) ).num ).toEqual( -6n );
    });
});
