/*
Intermediate data type that allows an easier conversion from (and to) CBOR to (and from) JSON serializables objects
*/

import { CborSimple, isRawCborSimple, isSimpleCborValue, RawCborSimple } from "./CborSimple";
import { CborNegInt, RawCborNegInt, isRawCborNegative } from "./CborNegInt";
import { CborArray, isRawCborArray, RawCborArray } from "./CborArray";
import { CborBytes, isRawCborBytes, RawCborBytes } from "./CborBytes";
import { CborUInt, RawCborUInt, isRawCborUnsigned } from "./CborUInt";
import { CborText, isRawCborText, RawCborText } from "./CborText";
import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import { CborMap, isRawCborMap, RawCborMap } from "./CborMap";
import { CborTag, isRawCborTag, RawCborTag } from "./CborTag";
import { BaseCborError } from "../errors";
import { assert } from "../utils/assert";

export  type RawCborObj
    = RawCborUInt
    | RawCborNegInt
    | RawCborBytes
    | RawCborText
    | RawCborArray
    | RawCborMap
    | RawCborTag
    | RawCborSimple;

export type CborObj
    = CborNegInt
    | CborUInt
    | CborBytes
    | CborText
    | CborArray
    | CborMap
    | CborTag
    | CborSimple;

export function isCborObj<T extends object>( cborObj: T ): cborObj is ( T & CborObj )
{
    const proto = Object.getPrototypeOf( cborObj );
    
    // only strict instances
    return (
        proto === CborNegInt.prototype      ||
        proto === CborUInt.prototype        ||
        proto === CborBytes.prototype       ||
        proto === CborText.prototype        ||
        proto === CborArray.prototype       ||
        proto === CborMap.prototype         ||
        proto === CborTag.prototype         ||
        proto === CborSimple.prototype
    )
}

export function isRawCborObj( rawCborObj: RawCborObj ): boolean
{
    if( typeof rawCborObj !== "object" || rawCborObj === null || Array.isArray( rawCborObj ) ) return false;

    const keys = Object.keys( rawCborObj );

    if( keys.length <= 0 ) return false;

    if( keys.includes("array") )
    {
        return Array.isArray( (rawCborObj as RawCborArray).array ) &&
        (rawCborObj as RawCborArray).array.every( isRawCborObj );
    }

    if( keys.includes("map") )
    {
        return Array.isArray( (rawCborObj as RawCborMap).map ) &&
        ( rawCborObj as RawCborMap ).map.every(
            entry => isRawCborObj( entry.k ) && isRawCborObj( entry.v )
        );
    }

    if( keys.includes( "tag" ) )
    {
        return keys.includes( "data" ) &&
        isRawCborObj( ( rawCborObj as RawCborTag ).data );
    }
    
    const includes = ( k: string ) => keys.includes(k);

    return (
        ( 
            includes( "neg" ) &&
            typeof( rawCborObj as RawCborNegInt ).neg === "bigint" &&
            ( rawCborObj as RawCborNegInt ).neg < 0 
        )                                                                                           ||
        ( 
            includes( "uint" ) &&
            typeof( rawCborObj as RawCborUInt ).uint === "bigint" &&
            ( rawCborObj as RawCborUInt ).uint >= 0
        )                                                                                           ||
        ( 
            includes( "bytes" ) && 
            isUint8Array( (rawCborObj as RawCborBytes).bytes ) 
        )                                                                                           ||
        ( 
            includes( "text" ) && 
            typeof( rawCborObj as RawCborText ).text === "string"
        )                                                                                           ||
        ( 
            includes( "simple" ) && 
            isSimpleCborValue( ( rawCborObj as RawCborSimple ).simple ) 
        )
    );
}

export function cborObjFromRaw( _rawCborObj: RawCborObj ): CborObj
{
    assert(
        isRawCborObj( _rawCborObj ),
        "expected a vaild 'RawCborObj' as input; got: " + Object.keys( _rawCborObj )
    );

    function _cborObjFromRaw( rawCborObj: RawCborObj ): CborObj
    {
        if( isRawCborNegative( rawCborObj as RawCborNegInt ) )
            return new CborNegInt( (rawCborObj as RawCborNegInt).neg );

        if( isRawCborUnsigned( rawCborObj as RawCborUInt ) )
            return new CborUInt( (rawCborObj as RawCborUInt).uint );

        if( isRawCborBytes( rawCborObj as RawCborBytes ) )
            return new CborBytes( (rawCborObj as RawCborBytes).bytes );

        if( isRawCborText( rawCborObj as RawCborText ) )
            return new CborText( (rawCborObj as RawCborText).text );

        if( isRawCborArray( rawCborObj as RawCborArray ) )
            return new CborArray(
                (rawCborObj as RawCborArray).array
                .map( _cborObjFromRaw ),
                (rawCborObj as any).options
            );

        if( isRawCborMap( rawCborObj as RawCborMap ) )
            return new CborMap(
                (rawCborObj as RawCborMap).map
                .map( entry => {
                    return {
                        k: _cborObjFromRaw( entry.k ),
                        v: _cborObjFromRaw( entry.v )
                    }
                }),
                (rawCborObj as any).options
            );

        if( isRawCborTag( rawCborObj as RawCborTag ) )
            return new CborTag( (rawCborObj as RawCborTag).tag, _cborObjFromRaw( (rawCborObj as RawCborTag).data ) );

        if( isRawCborSimple( rawCborObj as RawCborSimple ) )
            return new CborSimple( (rawCborObj as RawCborSimple).simple );

        throw new BaseCborError(
            "'cborObjFromRaw' did not match any possible 'RawCborObj'"
        );
    }

    return _cborObjFromRaw( _rawCborObj );
}
