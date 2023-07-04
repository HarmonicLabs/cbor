import { CborPositiveRational } from "..";

describe("CborPostiveRational", () => {

    describe("fromNumber", () => {

        test("toNumber identity", () => {

            function testId( n : number )
            {
                expect( CborPositiveRational.fromNumber( n ).toNumber() ).toEqual( n );
            }

            testId( 1 );
            testId( 2.5 );
            testId( Math.PI );
            testId( Math.E );

        })
    })
})