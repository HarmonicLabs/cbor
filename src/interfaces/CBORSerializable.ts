import type { CborString } from "../CborString";
import { CborObj } from "../CborObj/CborObj";
import { SubCborRef } from "../SubCborRef";

/**
 * @deprecated use `ToCborString` interface instead
 */
export interface CBORSerializable 
{
    toCBOR: () => CborString
}

export interface ToCborObj {
    toCborObj: () => CborObj
}

export interface ToCborString {
    toCbor: () => CborString
}

export interface ToCborBytes {
    /**
     * usually same result as `this.toCbor().toBytes()`
     * 
     * but if `this` remembers a `SubCborRef` object,
     * it can be uset to shortcut the process and just return the bytes
    **/
    toCborBytes: () => Uint8Array
}

export interface ToCbor extends ToCborObj, ToCborString, ToCborBytes
{
    /**
     * strictly require `SubCborRef` property to classes that want to implement `ToCbor`
     * 
     * if this is not desired, implement `ToCborString` and `ToCborObj` together to omit this requirement
    **/
    readonly cborRef: SubCborRef | undefined;
}

export interface FromCbor<T>
{
    fromCbor( cbor: CborString ): T,
    fromCborObj( cbor: CborObj ): T
}