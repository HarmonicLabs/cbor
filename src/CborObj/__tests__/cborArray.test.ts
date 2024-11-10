import { Cbor } from "../../Cbor";
import { CborArray } from "../CborArray";
import { CborUInt } from "../CborUInt";


test("cbor spec indefinite", () => {

    const str = "9f018202039f0405ffff";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 3 );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("standard 1 elem", () => {

    const str = "8101";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 1 );
    expect( parsed.array[0] instanceof CborUInt ).toBe( true );
    expect( (parsed.array[0] as CborUInt).num ).toEqual( BigInt(1) );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("1 elem, 1 byte header", () => {
    
    const str = "980101";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 1 );
    expect( parsed.array[0] instanceof CborUInt ).toBe( true );
    expect( (parsed.array[0] as CborUInt).num ).toEqual( BigInt(1) );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("1 elem, 2 byte header", () => {
        
    const str = "99000101";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 1 );
    expect( parsed.array[0] instanceof CborUInt ).toBe( true );
    expect( (parsed.array[0] as CborUInt).num ).toEqual( BigInt(1) );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("1 elem, 4 byte header", () => {
            
    const str = "9a0000000101";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 1 );
    expect( parsed.array[0] instanceof CborUInt ).toBe( true );
    expect( (parsed.array[0] as CborUInt).num ).toEqual( BigInt(1) );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("1 elem, 8 byte header", () => {
    
    const str = "9b000000000000000101";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 1 );
    expect( parsed.array[0] instanceof CborUInt ).toBe( true );
    expect( (parsed.array[0] as CborUInt).num ).toEqual( BigInt(1) );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("0 elem, 8 byte header", () => {
    
    const str = "9b0000000000000000";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 0 );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});

test("0 elem, indefinite", () => {
        
    const str = "9fff";
    const parsed = Cbor.parse( str ) as CborArray;

    expect( parsed instanceof CborArray ).toBe( true );
    expect( parsed.array.length ).toBe( 0 );

    expect(
        Cbor.encode( parsed ).toString()
    ).toEqual( str );
});