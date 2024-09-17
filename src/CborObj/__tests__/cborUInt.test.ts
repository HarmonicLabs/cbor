import { Cbor } from "../../Cbor";
import { CborUInt } from "../CborUInt";

describe("uint", () => {

    test("has num", () => {

        const parsed = Cbor.parse("1801") as CborUInt;

        expect( parsed.num ).toEqual( BigInt(1) );
    })

    test("remembers header", () => {

        const str = "1801";

        expect(
            Cbor.encode(
                Cbor.parse( str )
            ).toString()
        ).toEqual( str );

    });
});