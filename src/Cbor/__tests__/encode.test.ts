import { Cbor } from ".."
import { fromAscii, fromHex } from "@harmoniclabs/uint8array-utils";
import { cborObjFromRaw } from "../../CborObj"


describe( "Cbor.encode", () => {

    test("uint", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( 0 )
            })
        ) ).toEqual( fromHex( "00" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( 1 )
            })
        ) ).toEqual( fromHex( "01" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( Number.MAX_SAFE_INTEGER )
            })
        ) ).toEqual( fromHex( "1b001fffffffffffff" ) );

    });

    test("negative", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -1 )
            })
        ) ).toEqual( fromHex( "20" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -5 )
            })
        ) ).toEqual( fromHex( "24" ) );
        
        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -Number.MAX_SAFE_INTEGER )
            })
        ) ).toEqual( fromHex( "3b001ffffffffffffe" ) );
    });
    
    test("text", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                text: "ciaone"
            })
        ) ).toEqual( fromHex( "666369616F6E65" ) );

    });
    
    test("bytes", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                bytes: fromAscii( "ciaone" )
            })
        ) ).toEqual( fromHex( "466369616F6E65" ) );

    });
    
    test("array", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                array: [
                    { uint: BigInt( 1 ) },
                    { uint: BigInt( 2 ) },
                    { uint: BigInt( 3 ) },
                ]
            })
        ) ).toEqual( fromHex( "83010203" ) );

    });

    test("maps", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                map: [
                    {
                        k: { bytes: fromAscii("ciaone" ) },
                        v: { text: "mondone" }
                    },
                    {
                        k: { uint: BigInt( 1 ) },
                        v: {
                            array: [
                                { uint: BigInt( 2 ) },
                                { uint: BigInt( 3 ) }
                            ]
                        }
                    }
                ]
            })
        ) ).toEqual( fromHex( "A2466369616F6E65676D6F6E646F6E6501820203" ) );

    });

    test("tags", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                tag: 6,
                data: { array: [] }
            })
        ) ).toEqual( fromHex( "C680" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                tag: 6,
                data: { uint: BigInt( 2 ) }
            })
        ) ).toEqual( fromHex( "C602" ) );

    });

})