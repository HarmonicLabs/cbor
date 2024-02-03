import { CborPositiveRational } from "..";

describe("CborPostiveRational", () => {

    describe("fromNumber", () => {

        test("toNumber identity", () => {

            function testId( n : number )
            {
                const rational = CborPositiveRational.fromNumber( n );
                expect( rational.toNumber() ).toEqual( n );
            }

            testId( 1 );
            testId( 2.5 );
            testId( Math.PI );
            testId( Math.E );

            testId( 0.0577 );
            testId( 0.0000721 );

        });

    })
})