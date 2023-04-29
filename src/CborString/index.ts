import { CborObj } from "../CborObj/CborObj";
import { Cbor } from "../Cbor";
import { ByteString } from "@harmoniclabs/bytestring";

export class CborString extends ByteString
{
    static isStrictInstance( cborStr: any ): cborStr is CborString
    {
        return ( cborStr !== undefined && cborStr !== null ) && Object.getPrototypeOf( cborStr ) === CborString.prototype
    }

    constructor( cbor: string | Uint8Array )
    {
        if( typeof cbor === "string" )
        {
            cbor = cbor.split(" ").join("");
    
            // hex string length has to be even
            cbor = (cbor.length % 2) ? "0" + cbor : cbor;
        }
        
        super( cbor );
    }

    static fromCborObj( jsonCbor : CborObj ): CborString
    {
        return Cbor.encode( jsonCbor );
    }

    toCborObj(): CborObj
    {
        return Cbor.parse( this );
    }
}