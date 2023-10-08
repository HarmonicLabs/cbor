import { CborArrayOptions } from "../CborObj";
import { assert } from "../utils/assert";

const defaultOpts: Required<CborArrayOptions> = Object.freeze({
    indefinite: false
});

export class LazyCborArray
{
    readonly indefinite!: boolean

    array: Uint8Array[]

    constructor( array: Uint8Array[], options?: CborArrayOptions )
    {
        assert(
            Array.isArray( array ) &&
            array.every( elem => elem instanceof Uint8Array ),
            "in 'LazyCborArray' constructor: invalid input; got: " + array
        );

        const {
            indefinite
        } = {
            ...defaultOpts,
            ...options
        };

        let _array: Uint8Array[] = array;

        Object.defineProperties(
            this, {
                array: {
                    get: () => _array,
                    set: ( arr ) => {
                        if(
                            Array.isArray( arr ) &&
                            arr.every( elem => elem instanceof Uint8Array )
                        )
                        {
                            _array = arr
                        }
                    },
                    enumerable: true,
                    configurable: false
                },
                indefinite: {
                    value: indefinite,
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            }
        );

    }

    clone(): LazyCborArray
    {
        return new LazyCborArray(
            this.array.map( elem => Uint8Array.prototype.slice.call( elem ) ),
            { indefinite: this.indefinite }
        );
    }
}