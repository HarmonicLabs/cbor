import { Cbor } from "../../Cbor"
import { CborBytes } from "../CborBytes"


function getBytesFF( len: number = 0 ): Uint8Array
{
    return new Uint8Array(
        new Array( len ).fill( 0xff )
    );
}

describe("bytes", () => {

    describe("empty bytes", () => {

        const emptyBytes = new Uint8Array(0);

        test("canonical", () => {

            const str = "40";
            const parsed = Cbor.parse( str ) as CborBytes;

            expect( parsed instanceof CborBytes ).toBe( true );
            expect( parsed.bytes ).toEqual( emptyBytes );
            expect( parsed.chunks ).toEqual([ emptyBytes ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("1 byte for len", () => {

            const str = "5800";
            const parsed = Cbor.parse( str ) as CborBytes;

            expect( parsed instanceof CborBytes ).toBe( true );
            expect( parsed.bytes ).toEqual( emptyBytes );
            expect( parsed.chunks ).toEqual([ emptyBytes ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("2 bytes for len", () => {
                
            const str = "590000";
            const parsed = Cbor.parse( str ) as CborBytes;

            expect( parsed instanceof CborBytes ).toBe( true );
            expect( parsed.bytes ).toEqual( emptyBytes );
            expect( parsed.chunks ).toEqual([ emptyBytes ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("4 bytes for len", () => {
                
            const str = "5a00000000";
            const parsed = Cbor.parse( str ) as CborBytes;

            expect( parsed instanceof CborBytes ).toBe( true );
            expect( parsed.bytes ).toEqual( emptyBytes );
            expect( parsed.chunks ).toEqual([ emptyBytes ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );

        });

        test("8 bytes for len", () => {
                
            const str = "5b0000000000000000";
            const parsed = Cbor.parse( str ) as CborBytes;

            expect( parsed instanceof CborBytes ).toBe( true );
            expect( parsed.bytes ).toEqual( emptyBytes );
            expect( parsed.chunks ).toEqual([ emptyBytes ]);

            expect(
                Cbor.encode( parsed ).toString()
            ).toEqual( str );
        });

        describe("indefinite length", () => {

            test.only("empty with break", () => {

                const str = "5fff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite, one elem", () => {

                const str = "5f40ff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite, two elems", () => {

                const str = "5f405800ff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes, emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 3", () => {

                const str = "5f405800590000ff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes, emptyBytes, emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 4", () => {

                const str = "5f4058005900005a00000000ff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes, emptyBytes, emptyBytes, emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("indefinite 5", () => {

                const str = "5f4058005900005a000000005b0000000000000000ff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("nested indefinite", () => {

                const str = "5f5fffff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

            test("mixed", () => {

                const str = "5f4058005900005a000000005f4058005900005a00000000ffff";
                const parsed = Cbor.parse( str ) as CborBytes;

                expect( parsed instanceof CborBytes ).toBe( true );
                expect( parsed.bytes ).toEqual( emptyBytes );
                expect( parsed.chunks ).toEqual([ emptyBytes, emptyBytes, emptyBytes, emptyBytes, emptyBytes ]);

                expect(
                    Cbor.encode( parsed ).toString()
                ).toEqual( str );

            });

        });

    });

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