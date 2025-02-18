import { ByteString } from "@harmoniclabs/bytestring";
import { CborString } from "./CborString";

export type CanBeCborString = string | Uint8Array | ByteString;

export function forceCborString( cStr: CanBeCborString ): CborString
{
    return new CborString(
        cStr instanceof ByteString ? cStr.toBuffer() : cStr
    )
}

export function canBeCborString( stuff: any ): stuff is CanBeCborString
{
    return (
        typeof stuff === "string" ||
        stuff instanceof Uint8Array ||
        stuff instanceof ByteString
    );
}