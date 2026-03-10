import { CborArrayOptions } from "../CborObj";


const defaultOpts: Required<CborArrayOptions> = Object.freeze({
    indefinite: false,
    addInfos: 0
});

export class LazyCborArray
{
    readonly indefinite!: boolean

    array: Uint8Array[]

    constructor( array: Uint8Array[], options?: CborArrayOptions )
    {
        if(!(
            Array.isArray( array ) &&
            array.every( elem => elem instanceof Uint8Array )
        )) throw new Error(
            "in 'LazyCborArray' constructor: invalid input; got: " + array
        );

        const {
            indefinite
        } = {
            ...defaultOpts,
            ...options
        };

        let _array: Uint8Array[] = array;

        this.array = array;
        this.indefinite = indefinite;
    }

    clone(): LazyCborArray
    {
        return new LazyCborArray(
            this.array.map( elem => Uint8Array.prototype.slice.call( elem ) ),
            { indefinite: this.indefinite }
        );
    }
}