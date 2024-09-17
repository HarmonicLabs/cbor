import { Cbor } from "../../Cbor"
import { CborBytes } from "../CborBytes"

describe("bytes", () => {

    test("4601070a0f1418", () => {

        expect(
            Cbor.encode(
                new CborBytes(
                    new Uint8Array([0x01, 0x07, 0x0a, 0x0f, 0x14, 0x18])
                )
            ).toString()
        ).toEqual("4601070a0f1418");
        
    })
})