export type CanBeUInteger
    = bigint
    | number;

export function canBeUInteger( something: any ): something is (number | bigint)
{
    return (
        (typeof something === "bigint" && something >= BigInt( 0 ) ) ||
        (typeof something === "number" && something === Math.round( Math.abs( something ) ) )
    );
}

export function forceBigUInt( toForce: CanBeUInteger ): bigint
{
    if( !canBeUInteger( toForce ) )
    {
        // console.error( toForce );
        throw new Error( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return BigInt( toForce );
};

export function unsafeForceUInt( toForce: CanBeUInteger ): number
{
    if( !canBeUInteger( toForce ) )
    {
        // console.error( toForce );
        throw new Error( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return Number( toForce ); 
}
/**
 * big-endian unsigned magnitude of a bignum (RFC 8949 §3.4.3);
 * an empty byte string is a valid encoding of 0
 */
export function bigUIntFromBytes( bytes: Uint8Array ): bigint
{
    if( bytes.length === 0 ) return BigInt( 0 );
    let hex = "";
    for( let i = 0; i < bytes.length; i++ )
        hex += bytes[i].toString( 16 ).padStart( 2, "0" );
    return BigInt( "0x" + hex );
}
