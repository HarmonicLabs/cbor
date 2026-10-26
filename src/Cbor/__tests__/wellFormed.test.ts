import { Cbor } from "..";

/** RFC 8949 §3.2.4: a tag head with additional info 31 is not well-formed */
describe("indefinite-length tag head", () => {
    test.each([ "df01", "df8001", "8201df01" ])( "%s is rejected", hex => {
        expect( () => Cbor.parse( hex ) ).toThrow();
    });
});
