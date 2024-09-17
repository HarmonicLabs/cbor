import { CborObj, isRawCborObj, RawCborObj } from ".";
import { ToRawObj } from "./interfaces/ToRawObj";

export interface CborMapOptions {
    indefinite?: boolean
}

export type RawCborMapEntry = {
    k: RawCborObj,
    v: RawCborObj
};

export type RawCborMap = {
    map: RawCborMapEntry[],
    options?: CborMapOptions
}

export function isRawCborMap( m: RawCborMap ): boolean
{
    if( typeof m !== "object" || m === null ) return false;

    const keys = Object.keys( m );

    return (
        keys.includes("map") &&
        Array.isArray( m.map ) &&
        m.map.every( entry => {
            if( typeof entry !== "object" || entry === null ) return false;

            const entryKeys = Object.keys( entry ); 
            
            return (
                entryKeys.includes( "k" )   &&
                isRawCborObj( entry.k )     &&
                entryKeys.includes( "v" )   &&
                isRawCborObj( entry.v )
            );
        } )
    );
}

export type CborMapEntry = {
    k: CborObj,
    v: CborObj
};

export class CborMap
    implements ToRawObj
{
    private readonly _map : CborMapEntry[];
    get map(): CborMapEntry[]
    {
        return this._map;
    }
    
    private readonly _indefinite!: boolean;
    get indefinite(): boolean
    {
        return this._indefinite;
    }

    constructor( map: CborMapEntry[], options?: CborMapOptions )
    {
        this._indefinite = options?.indefinite === true ? true : false;
        this._map = map;
    }

    toRawObj(): RawCborMap
    {
        return {
            map: this.map.map(( entry ) => {
                return {
                    k: entry.k.toRawObj(),
                    v: entry.v.toRawObj()
                };
            }),
            options : {
                indefinite: this.indefinite
            }
        };
    }

    clone(): CborMap
    {
        return new CborMap(
            this.map.map(( entry ) => ({
                k: entry.k.clone(),
                v: entry.v.clone()
            })),
            { indefinite: this.indefinite }
        );
    }
}
