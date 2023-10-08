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
    const proto = Object.getPrototypeOf( cborObj );
    
    // only strict instances
    return (
        proto === CborNegInt.prototype      ||
        proto === CborUInt.prototype        ||
        proto === CborBytes.prototype       ||
        proto === CborText.prototype        ||
        proto === LazyCborArray.prototype   ||
        proto === LazyCborMap.prototype     ||
        proto === LazyCborTag.prototype     ||
        proto === CborSimple.prototype
    );
}