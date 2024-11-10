import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { CborMapOptions } from "../CborObj";
import { assert } from "../utils/assert";

export type LazyCborMapEntry = {
    k: Uint8Array,
    v: Uint8Array
};

const defaultOpts: Required<CborMapOptions> = Object.freeze({
    indefinite: false,
    addInfos: undefined as any
});

export function isLazyCborMapEntry( thing: any ): thing is LazyCborMapEntry
{
    return isObject( thing ) && (
        hasOwn( thing, "k" ) && thing.k instanceof Uint8Array &&
        hasOwn( thing, "v" ) && thing.v instanceof Uint8Array
    );
}

export class LazyCborMap
{
    readonly indefinite!: boolean;

    map: LazyCborMapEntry[]

    constructor( map: LazyCborMapEntry[], options?: CborMapOptions )
    {
        assert(
            Array.isArray( map ) &&
            map.every( isLazyCborMapEntry ),
            "in 'LazyCborMap' constructor: invalid input; got: " + map
        );
        
        const {
            indefinite
        } = {
            ...defaultOpts,
            ...options
        };

        let _map: LazyCborMapEntry[] = map;

        Object.defineProperties(
            this, {
                array: {
                    get: () => _map,
                    set: ( newMap ) => {
                        if(
                            Array.isArray( newMap ) &&
                            newMap.every( isLazyCborMapEntry )
                        )
                        {
                            _map = newMap
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

    clone(): LazyCborMap
    {
        return new LazyCborMap(
            this.map.map(({ k, v }) => ({
                k: Uint8Array.prototype.slice.call( k ),
                v: Uint8Array.prototype.slice.call( v ),
            })),
            { indefinite: this.indefinite }
        );
    }
}