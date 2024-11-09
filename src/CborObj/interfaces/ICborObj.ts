
export interface ICborObj {
    /** 5 bit unsigne integer */
    addInfos: number;
    /** bytes immediately following the header, usually payload length */
    // followingHeaderBytes: Uint8Array | undefined;
}