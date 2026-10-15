import { Cbor } from "..";
import { CborUInt } from "../../CborObj/CborUInt";
import { CborNegInt } from "../../CborObj/CborNegInt";
import { CborTag } from "../../CborObj/CborTag";
import { CborBytes } from "../../CborObj/CborBytes";
import { toHex, fromHex } from "@harmoniclabs/uint8array-utils";

/**
 * BIGNUM ENCODING (RFC 8949 §3.4.3, tags 2 and 3).
 *
 * CBOR's native integer heads cover 0 .. 2^64-1 and -1 .. -2^64; anything
 * outside that must go out as a tagged byte string — tag 2 for positive,
 * tag 3 for negative, whose payload is `-1 - value`.
 *
 * Two bugs lived here:
 *
 *  1. `CborNegInt`'s `num` setter REUSED its parameter to hold the tag-3
 *     payload and then stored that as the value, so a negative object ended
 *     up holding a positive number. `Cbor.encode` rejected it outright with
 *     "encoding invalid negative integer as CBOR" — NO integer below -(2^64)
 *     could be serialised at all.
 *  2. Both `CborUInt` and `CborNegInt` constructors ended with an
 *     unconditional `else this.bigNumEncoding = undefined`, discarding the
 *     encoding the setter had just derived. Positives above 2^64 therefore
 *     fell into the encoder's warn-and-recover path, printing a
 *     "bigNumEncoding is not set ... please report this issue" warning and
 *     dumping the object to the console on every single value.
 *
 * These tests pin the byte-level output against the spec rather than only
 * round-tripping, because a round trip stays green when encoder and decoder
 * are wrong in matching ways.
 */

const hexOf = ( o: CborUInt | CborNegInt ): string => toHex( Cbor.encode( o ) );

/** value -> expected bytes, derived from RFC 8949 §3.4.3 by hand */
const KNOWN_VECTORS: [ bigint, string ][] = [
    // native heads (no tag)
    [                     0n, "00" ],
    [                    -1n, "20" ],
    [  (1n << 63n)          , "1b8000000000000000" ],
    [ -(1n << 63n)          , "3b7fffffffffffffff" ],
    [  (1n << 64n) - 1n     , "1bffffffffffffffff" ],   // largest native uint
    [ -(1n << 64n)          , "3bffffffffffffffff" ],   // most negative native
    // tag 2 / tag 3 bignums start exactly one step further out
    [  (1n << 64n)          , "c249010000000000000000" ],
    [ -(1n << 64n) - 1n     , "c349010000000000000000" ],
    [  (1n << 65n)          , "c249020000000000000000" ],
    [ -(1n << 65n)          , "c34901ffffffffffffffff" ],
];

describe("RFC 8949 bignums (tags 2 and 3)", () => {

    test.each( KNOWN_VECTORS )( "%s encodes to the spec bytes", ( value, expected ) => {
        const obj = value < 0n ? new CborNegInt( value ) : new CborUInt( value );
        expect( hexOf( obj ) ).toEqual( expected );
    });

    // the defect that made negatives unencodable: the object must hold the
    // VALUE, never the tag-3 payload
    test("a CborNegInt reports the value it was constructed with", () => {
        for( let p = 60; p <= 130; p++ )
        {
            for( const v of [ -(1n << BigInt(p)), -(1n << BigInt(p)) - 1n ] )
            {
                expect({ p, num: new CborNegInt( v ).num }).toEqual({ p, num: v });
            }
        }
    });

    test("values outside the native range carry a bignum encoding", () => {
        expect( new CborUInt(   (1n << 64n)      ).isBigNum ).toBe( true );
        expect( new CborNegInt( -(1n << 64n) - 1n ).isBigNum ).toBe( true );
        // ...and values inside it do NOT (a spurious tag would change bytes)
        expect( new CborUInt(   (1n << 64n) - 1n ).isBigNum ).toBe( false );
        expect( new CborNegInt( -(1n << 64n)     ).isBigNum ).toBe( false );
    });

    test("encoding emits no warnings for large values", () => {
        const warn = jest.spyOn( console, "warn" ).mockImplementation( () => {} );
        const dir  = jest.spyOn( console, "dir"  ).mockImplementation( () => {} );
        try {
            for( let p = 64; p <= 200; p += 8 )
            {
                Cbor.encode( new CborUInt(   1n << BigInt(p) ) );
                Cbor.encode( new CborNegInt( -(1n << BigInt(p)) ) );
            }
            expect( warn ).not.toHaveBeenCalled();
            expect( dir  ).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
            dir.mockRestore();
        }
    });
});

describe("bignum round trips", () => {

    /** boundaries either side of every native/bignum transition, both signs */
    const values = (): bigint[] => {
        const vs: bigint[] = [ 0n, 1n, -1n, 23n, 24n, -24n, -25n ];
        for( const p of [ 7, 8, 15, 16, 31, 32, 63, 64, 65, 100, 128, 200 ] )
        {
            const v = 1n << BigInt( p );
            vs.push( v - 1n, v, v + 1n, -v + 1n, -v, -v - 1n );
        }
        return vs;
    };

    test.each( values() )( "%s survives encode -> parse", ( v ) => {
        const obj = v < 0n ? new CborNegInt( v ) : new CborUInt( v );
        const back = Cbor.parse( Cbor.encode( obj ) ) as CborUInt | CborNegInt;
        expect( back.num ).toEqual( v );
    });

    test("a decoded bignum re-encodes to the same bytes", () => {
        for( const v of values() )
        {
            const obj = v < 0n ? new CborNegInt( v ) : new CborUInt( v );
            const first = hexOf( obj );
            const back = Cbor.parse( fromHex( first ) ) as CborUInt | CborNegInt;
            expect({ v, hex: hexOf( back ) }).toEqual({ v, hex: first });
        }
    });

    // `bigNum()` builds the object from an explicit payload; it must agree
    // with the plain constructor, which derives the payload itself
    test("the bigNum() constructor agrees with the plain constructor", () => {
        for( const p of [ 64, 65, 100, 200 ] )
        {
            const pos = 1n << BigInt( p );
            expect({ p, hex: hexOf( CborUInt.bigNum( pos ) ) })
                .toEqual({ p, hex: hexOf( new CborUInt( pos ) ) });

            const neg = -( 1n << BigInt( p ) ) - 1n;
            expect({ p, hex: hexOf( CborNegInt.bigNum( neg ) ) })
                .toEqual({ p, hex: hexOf( new CborNegInt( neg ) ) });
        }
    });

    // an explicitly supplied encoding must still win over the derived one
    test("an explicit bigNumEncoding is preserved", () => {
        const payload = new CborBytes( fromHex("010000000000000000") ); // 2^64
        expect( hexOf( new CborUInt( 1n << 64n, 0, payload ) ) )
            .toEqual( "c249010000000000000000" );
        expect( hexOf( new CborNegInt( -(1n << 64n) - 1n, 0, payload ) ) )
            .toEqual( "c349010000000000000000" );
    });

    test("tag 2 / tag 3 written by hand decode to the right value", () => {
        const asTag = ( tag: number, hex: string ) =>
            Cbor.parse( Cbor.encode( new CborTag( tag, new CborBytes( fromHex( hex ) ) ) ) );

        expect( ( asTag( 2, "010000000000000000" ) as CborUInt ).num ).toEqual( 1n << 64n );
        expect( ( asTag( 3, "010000000000000000" ) as CborNegInt ).num ).toEqual( -(1n << 64n) - 1n );
    });
});
