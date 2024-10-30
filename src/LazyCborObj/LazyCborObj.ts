import { CborNegInt, CborUInt, CborBytes, CborText, CborSimple, CborArray, CborMap, CborTag } from "../CborObj";
import { LazyCborArray } from "./LazyCborArray";
import { LazyCborMap } from "./LazyCborMap";
import { LazyCborTag } from "./LazyCborTag";


export type LazyCborObj
    = CborNegInt
    | CborUInt
    | CborBytes
    | CborText
    | LazyCborArray
    | LazyCborMap
    | LazyCborTag
    | CborSimple;

export function isLazyCborObj<T extends object>( cborObj: T ): cborObj is (T & LazyCborObj)
{
    // only strict instances
    return (
        cborObj instanceof CborNegInt      ||
        cborObj instanceof CborUInt        ||
        cborObj instanceof CborBytes       ||
        cborObj instanceof CborText        ||
        cborObj instanceof LazyCborArray   ||
        cborObj instanceof LazyCborMap     ||
        cborObj instanceof LazyCborTag     ||
        cborObj instanceof CborSimple
    );
}