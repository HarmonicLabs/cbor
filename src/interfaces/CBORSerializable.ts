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

export interface ToCbor extends ToCborObj, ToCborString
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