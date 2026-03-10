import { fromHex } from "@harmoniclabs/uint8array-utils";

export type CanBeCborString = string | Uint8Array;

export function forceCborString( cStr: CanBeCborString ): Uint8Array
{
    if( typeof cStr === "string" ) return fromHex( cStr );
    if( !( cStr instanceof Uint8Array ) ) throw new Error("invalid cbor string");

    return cStr;
}

export function canBeCborString( stuff: any ): stuff is CanBeCborString
{
    return (
        typeof stuff === "string" ||
        stuff instanceof Uint8Array
    );
}