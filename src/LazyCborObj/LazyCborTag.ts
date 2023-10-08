import { assert } from "../utils/assert";
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

        assert(
            typeof tag === "bigint" &&
            isLazyCborObj( data ),
            "using direct value constructor; either 'tag' is not a number or 'data' is not 'LazyCborObj'"
        );

        let _tag: bigint = tag;
        let _data: LazyCborObj = data
        Object.defineProperties(
            this, {
                tag: {
                    get: () => _tag,
                    set: ( val ) => {
                        if( typeof tag === "number" ) tag = BigInt( tag );
                        if( typeof tag === "bigint" )
                        {
                            _tag = tag;
                        }
                    },
                    enumerable: true,
                    configurable: false
                },
                data: {
                    get: () => _data,
                    set: ( val ) => {
                        if( isLazyCborObj( val ) )
                        {
                            _data = val
                        }
                    },
                    enumerable: true,
                    configurable: false
                }
            }
        );
    }

    clone(): LazyCborTag
    {
        return new LazyCborTag(
            this.tag,
            this.data.clone()
        )
    }
}