import { Cbor, CborText } from "..";

test("getting started", () => {

    const input = "6B68656C6C6F20776F726C64";

    const cborObj = Cbor.parse("6B68656C6C6F20776F726C64");

    expect( cborObj instanceof CborText ).toBe( true );

    if( cborObj instanceof CborText )
    {
        expect( cborObj.text ).toEqual("hello world");
        // console.log( cborObj.text ) // prints "hello world"
    }

    const encoded = Cbor.encode( cborObj ).toString();

    expect( encoded ).toEqual( input.toLowerCase() );
    // console.log( encoded ) // prints "6b68656c6c6f20776f726c64" (lower case hex)

})