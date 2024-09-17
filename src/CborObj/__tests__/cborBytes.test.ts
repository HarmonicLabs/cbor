import { toHex } from "@harmoniclabs/uint8array-utils";
import { CborBytes } from "../CborBytes";

describe("testing CborBytes", () => {
    
    test("returns the correct byte string", () => {

        expect(() => {
            toHex( new CborBytes( new Uint8Array([1, 7, 10, 15, 20, 24]) ).bytes );
        }).toEqual("7001070a0f1418");

    });

});