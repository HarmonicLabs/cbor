import { Cbor } from "../../Cbor"
import { CborText } from "../CborText"

describe("bytes", () => {

    describe("empty bytes", () => {

        const emptyStr = "";

        test("canonical", () => {

            const str = "60";
            const parsed = Cbor.parse( str ) as CborText;

            expect( parsed instanceof CborText ).toBe( true );
            expect( parsed.text ).toEqual( emptyStr );
            // expect( parsed.chunks ).toEqual( emptyStr );

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("1 byte for len", () => {

            const str = "7800";
            const parsed = Cbor.parse( str ) as CborText;

            expect( parsed instanceof CborText ).toBe( true );
            expect( parsed.text ).toEqual( emptyStr );
            // expect( parsed.chunks ).toEqual( emptyStr );

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("2 bytes for len", () => {
                
            const str = "790000";
            const parsed = Cbor.parse( str ) as CborText;

            expect( parsed instanceof CborText ).toBe( true );
            expect( parsed.text ).toEqual( emptyStr );
            // expect( parsed.chunks ).toEqual([ emptyStr ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("4 bytes for len", () => {
                
            const str = "7a00000000";
            const parsed = Cbor.parse( str ) as CborText;

            expect( parsed instanceof CborText ).toBe( true );
            expect( parsed.text ).toEqual( emptyStr );
            // expect( parsed.chunks ).toEqual([ emptyStr ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("8 bytes for len", () => {
                
            const str = "7b0000000000000000";
            const parsed = Cbor.parse( str ) as CborText;

            expect( parsed instanceof CborText ).toBe( true );
            expect( parsed.text ).toEqual( emptyStr );
            // expect( parsed.chunks ).toEqual([ emptyStr ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );
        });

        describe("indefinite length", () => {

            test("empty with break", () => {

                const str = "7fff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite, one elem", () => {

                const str = "7f60ff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ new CborText( emptyStr ) ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite, two elems", () => {

                const str = "7f607800ff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ emptyStr, emptyStr ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 3", () => {

                const str = "7f607800790000ff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ emptyStr, emptyStr, emptyStr ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 4", () => {

                const str = "7f6078007900007a00000000ff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ emptyStr, emptyStr, emptyStr, emptyStr ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 5", () => {

                const str = "7f6078007900007a000000007b0000000000000000ff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ emptyStr, emptyStr, emptyStr, emptyStr, emptyStr ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("nested indefinite", () => {

                const str = "7f7fffff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );
                // expect( parsed.chunks ).toEqual([ emptyStr ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("mixed", () => {

                const str = "7f6078007900007a000000007f6078007900007a00000000ffff";
                const parsed = Cbor.parse( str ) as CborText;

                expect( parsed instanceof CborText ).toBe( true );
                expect( parsed.text ).toEqual( emptyStr );

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

        });

    });

    test("indefinite length", () => {

        const cbor = (
            new CborText(
                [
                    "hello",
                    "hello",
                    "hello",
                ].map( bs => new CborText( bs ) )
            )
        );
        const cborStr = Cbor.encode( cbor );

        const rawBytes = cbor.text

        expect(
            rawBytes
        ).toEqual(
            "hello".repeat(3)
        )

        const str = cborStr.toString();

        expect(
            str
        ).toEqual("7f6568656c6c6f6568656c6c6f6568656c6c6fff");

    });

    test("definite length preserved", () => {

        const str = "6568656C6C6F".toLowerCase();

        const cbor = (
            new CborText(
                "hello"
            )
        );

        expect(
            Cbor.encode( cbor ).toString()
        ).toEqual( str )

    });

    test("perserves number of header bytes", () => {
        const str = "780107";

        expect(
            Cbor.encode(
                Cbor.parse( str )
            ).toString()
        ).toEqual( str )
    })
})