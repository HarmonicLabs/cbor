import { readBigUInt64BE, readFloat32BE, readFloat64BE, readUint16BE, readUint32BE, readUint8 } from "@harmoniclabs/uint8array-utils";
import { MajorType } from "../Cbor/Constants";

export function readCborTypeAndLength( bytes: Uint8Array ): { type: MajorType, length: number| bigint | undefined } | undefined
{
    if( bytes.length < 1 ) return undefined;


    const headerByte = bytes[0];

    const major : MajorType = headerByte >> 5;
    const addInfos = headerByte & 0b000_11111;

    if( major === MajorType.float_or_simple )
    {
        if( addInfos === 25 )
        {
            const float = getFloat16( bytes );
            if( float === undefined ) return undefined;
            return {
                type: major,
                length: float
            };
        }
        if( addInfos === 26 )
        {
            const float = getFloat32( bytes );
            if( float === undefined ) return undefined;
            return {
                type: major,
                length: float
            };
        }
        if( addInfos === 27 )
        {
            const float = getFloat64( bytes );
            if( float === undefined ) return undefined;
            return {
                type: major,
                length: float
            };
        }
        return {
            type: major,
            length: addInfos
        };
    }

    const length = getLength( addInfos, bytes );
    
    if( typeof length !== "bigint" ) return undefined;
    
    if( length < 0 )
    return {
        type: major,
        length: undefined // indefinite length
    }
    else
    return {
        type: major,
        length: length
    }

    // if( length < 0 &&
    //     ( major < 2 || major > 6 )
    // )
    // {
    //     throw new BaseCborError( "unexpected indefinite length element while parsing CBOR" );
    // }
}

function getLength( addInfos: number, bytes: Uint8Array ): bigint | undefined
{
    if (addInfos < 24)
        return BigInt( addInfos );
    if (addInfos === 24)
    {
        if( bytes.length < 2 ) return undefined;
        return BigInt( readUint8( bytes, 1 ) );
    }
    if (addInfos === 25)
    {
        if( bytes.length < 3 ) return undefined;
        return BigInt( readUint16BE( bytes, 1 ) );
    }
    if (addInfos === 26)
    {
        if( bytes.length < 5 ) return undefined;
        return BigInt( readUint32BE( bytes, 1 ) );
    }
    if (addInfos === 27)
    {
        if( bytes.length < 9 ) return undefined;
        return BigInt( readBigUInt64BE( bytes, 1 ) );
    }
    if (addInfos === 31)
        return BigInt( -1 ); // indefinite length element follows

    // throw new BaseCborError( "Invalid length encoding while parsing CBOR" );
    return undefined;
}

function getFloat16( bytes: Uint8Array ): number | undefined
{
    if( bytes.length < 3 ) return undefined;

    // increments the offset here
    const floatBits = readUint16BE( bytes, 1 );

    let tempArrayBuffer = new ArrayBuffer(4);
    let tempDataView = new DataView(tempArrayBuffer);

    const sign =      floatBits & 0b1_00000_0000000000;
    let exponent =    floatBits & 0b0_11111_0000000000;
    let fraction =    floatBits & 0b0_00000_1111111111;

    if (exponent === 0x7c00)
        exponent = 0xff << 10;
    else if (exponent !== 0)
        exponent += (127 - 15) << 10;
    else if (fraction !== 0)
        return (sign !== 0 ? -1 : 1) * fraction * 5.960464477539063e-8
    
    tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);

    return tempDataView.getFloat32( 0 )
}

function getFloat32( bytes: Uint8Array  ): number | undefined
{
    if( bytes.length < 5 ) return undefined;
    return readFloat32BE( bytes, 1 );
}

function getFloat64( bytes: Uint8Array ): number | undefined
{
    if( bytes.length < 9 ) return undefined;
    return readFloat64BE( bytes, 1 )
}