import { LazyCborObj, isLazyCborObj } from "./LazyCborObj";

export class LazyCborTag
{
    tag: bigint
    data: LazyCborObj

    constructor( tag: number | bigint, data: LazyCborObj )
    {
        if( typeof tag === "number" )
        {
            tag = BigInt( tag );
        }

        if(!(
            typeof tag === "bigint" &&
            isLazyCborObj( data )
        )) throw new Error(
            "using direct value constructor; either 'tag' is not a number or 'data' is not 'LazyCborObj'"
        );

        let _tag: bigint = tag;
        let _data: LazyCborObj = data
        this.tag = tag;
        this.data = data;
    }

    clone(): LazyCborTag
    {
        return new LazyCborTag(
            this.tag,
            this.data.clone()
        )
    }
}