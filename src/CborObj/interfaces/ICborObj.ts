import { SubCborRef } from "../../SubCborRef";

export interface ICborObj {
    /** 5 bit unsigned integer */
    addInfos: number;
    /** reference to a buffer corresponding to the parse (or to encode) cbor object */
    subCborRef?: SubCborRef | undefined
}