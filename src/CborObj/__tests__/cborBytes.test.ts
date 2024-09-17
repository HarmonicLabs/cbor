import { Cbor } from "../../Cbor"
import { CborBytes } from "../CborBytes"

describe("bytes", () => {

    test("indefinite length", () => {

        const cbor = (
            new CborBytes(
                new Uint8Array([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18]),
                [
                    new Uint8Array([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18]),
                    new Uint8Array([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18]),
                ]
            )
        );
        const cborStr = Cbor.encode( cbor );

        const rawBytes = cbor.bytes

        expect(
            rawBytes
        ).toEqual(
            new Uint8Array(
                [0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18]
                .concat([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18])
                .concat([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18])
            )
        )

        const str = cborStr.toString();

        expect(
            str
        ).toEqual("5f4601070a0f14184601070a0f14184601070a0f1418ff");

    });

    test("definite length preserved", () => {

        const str = "4601070A0F1418".toLowerCase();

        const cbor = (
            new CborBytes(
                new Uint8Array([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18])
            )
        );

        expect(
            Cbor.encode( cbor ).toString()
        ).toEqual( str )

    });

    test("perserves number of header bytes", () => {
        const str = "580107";

        expect(
            Cbor.encode(
                Cbor.parse( str )
            ).toString()
        ).toEqual( str )
    })
})