import { Cbor } from ".."
import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { cborObjFromRaw } from "../../CborObj"
import { CborString } from "../../CborString"


describe( "Cbor.encode", () => {

    test("uint", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( 0 )
            })
        ) ).toEqual( new CborString( "00" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( 1 )
            })
        ) ).toEqual( new CborString( "01" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                uint: BigInt( Number.MAX_SAFE_INTEGER )
            })
        ) ).toEqual( new CborString( "1b001fffffffffffff" ) );

    });

    test("negative", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -1 )
            })
        ) ).toEqual( new CborString( "20" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -5 )
            })
        ) ).toEqual( new CborString( "24" ) );
        
        expect( Cbor.encode(
            cborObjFromRaw({
                neg: BigInt( -Number.MAX_SAFE_INTEGER )
            })
        ) ).toEqual( new CborString( "3b001ffffffffffffe" ) );
    });
    
    test("text", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                text: "ciaone"
            })
        ) ).toEqual( new CborString( "666369616f6e65" ) );

    });
    
    test("bytes", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                bytes: fromAscii( "ciaone" )
            })
        ) ).toEqual( new CborString( "466369616f6e65" ) );

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
        ) ).toEqual( new CborString( "83010203" ) );

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
        ) ).toEqual( new CborString( "a2466369616f6e65676d6f6e646f6e6501820203" ) );

    });

    test("tags", () => {

        expect( Cbor.encode(
            cborObjFromRaw({
                tag: 6,
                data: { array: [] }
            })
        ) ).toEqual( new CborString( "c680" ) );

        expect( Cbor.encode(
            cborObjFromRaw({
                tag: 6,
                data: { uint: BigInt( 2 ) }
            })
        ) ).toEqual( new CborString( "c602" ) );

    });

})