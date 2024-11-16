import { CborArray, CborBytes, CborMap, CborNegInt, CborObj, CborTag, CborText, CborUInt } from "../CborObj";
import { SubCborRef } from "../SubCborRef";

export function overwriteSubCborRefBytes( cObj: CborObj, bytes: Uint8Array ): void
{
    if(!( cObj.subCborRef instanceof SubCborRef )) return;

    if(
        cObj instanceof CborText &&
        typeof cObj.chunks !== "string"
    )
    {
        for( const chunk of cObj.chunks )
        {
            overwriteSubCborRefBytes( chunk, bytes );
        }
    }

    if(
        cObj instanceof CborBytes &&
        !(cObj.chunks instanceof Uint8Array)
    )
    {
        for( const chunk of cObj.chunks )
        {
            overwriteSubCborRefBytes( chunk, bytes );
        }
    }

    if( cObj instanceof CborTag )
    {
        overwriteSubCborRefBytes( cObj.data, bytes );
    }

    if(
        (cObj instanceof CborUInt || cObj instanceof CborNegInt) &&
        cObj.bigNumEncoding instanceof CborBytes
    )
    {
        overwriteSubCborRefBytes( cObj.bigNumEncoding, bytes );
    }

    if( cObj instanceof CborMap )
    {
        for( const { k, v } of cObj.map )
        {
            overwriteSubCborRefBytes( k, bytes );
            overwriteSubCborRefBytes( v, bytes );
        }
    }

    if( cObj instanceof CborArray )
    {
        for( const elem of cObj.array )
        {
            overwriteSubCborRefBytes( elem, bytes );
        }
    }

    cObj.subCborRef._bytes = bytes;
}