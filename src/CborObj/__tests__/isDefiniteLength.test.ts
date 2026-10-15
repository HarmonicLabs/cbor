import { toHex } from "@harmoniclabs/uint8array-utils";
import { Cbor } from "../../Cbor";
import { CborText } from "../CborText";
import { CborBytes } from "../CborBytes";
import { CborArray } from "../CborArray";

/**
 * cardano-ledger accepts indefinite-length (chunked) byte and text strings
 * only inside Plutus Data and transaction metadata; hashes, keys,
 * addresses, URLs and DNS names must be definite (node-diversity-conformance
 * item 570). The parser therefore keeps the chunks and `isDefiniteLength`
 * reports the source form for both strings.
 */
describe("isDefiniteLength", () => {

    test.each([
        [ "60", "", true ],
        [ "6161", "a", true ],
        [ "7fff", "", false ],
        [ "7f6161ff", "a", false ],
        [ "7f61616162ff", "ab", false ],
        [ "7f6161616260ff", "ab", false ], // empty chunk kept
    ])( "text %s", ( hex, text, definite ) => {
        const parsed = Cbor.parse( hex ) as CborText;
        expect( parsed instanceof CborText ).toBe( true );
        expect( parsed.text ).toEqual( text );
        expect( parsed.isDefiniteLength ).toBe( definite );
        expect( typeof parsed.isDefiniteLength ).toBe( "boolean" );
        expect( parsed.clone().isDefiniteLength ).toBe( definite );
        // the source form is written back
        expect( toHex( Cbor.encode( parsed ) ) ).toEqual( hex );
    });

    test.each([
        [ "40", "", true ],
        [ "4101", "01", true ],
        [ "5fff", "", false ],
        [ "5f4101ff", "01", false ],
        [ "5f41014102ff", "0102", false ],
    ])( "bytes %s", ( hex, bytes, definite ) => {
        const parsed = Cbor.parse( hex ) as CborBytes;
        expect( parsed instanceof CborBytes ).toBe( true );
        expect( toHex( parsed.bytes ) ).toEqual( bytes );
        expect( parsed.isDefiniteLength ).toBe( definite );
        expect( parsed.clone().isDefiniteLength ).toBe( definite );
        expect( toHex( Cbor.encode( parsed ) ) ).toEqual( hex );
    });

    test("chunks are exposed", () => {
        const t = Cbor.parse( "7f61616162ff" ) as CborText;
        expect( Array.isArray( t.chunks ) ).toBe( true );
        expect( ( t.chunks as CborText[] ).map( c => c.text ) ).toEqual([ "a", "b" ]);
        const b = Cbor.parse( "5f41014102ff" ) as CborBytes;
        expect( ( b.chunks as CborBytes[] ).map( c => toHex( c.bytes ) ) ).toEqual([ "01", "02" ]);
    });

    test("nested (parseWithOffset)", () => {
        const { parsed } = Cbor.parseWithOffset( "82" + "7f6161ff" + "6161" );
        const [ a, b ] = ( parsed as CborArray ).array as CborText[];
        expect( a.isDefiniteLength ).toBe( false );
        expect( b.isDefiniteLength ).toBe( true );
    });

    test("constructed", () => {
        expect( new CborText( "a" ).isDefiniteLength ).toBe( true );
        expect( new CborText([ new CborText( "a" ) ]).isDefiniteLength ).toBe( false );
    });
});
