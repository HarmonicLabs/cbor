import { defineReadOnlyProperty, isObject } from "@harmoniclabs/obj-utils";
import { CborObj, cborObjFromRaw, isCborObj, isRawCborObj, RawCborObj } from ".";
import { ToRawObj } from "./interfaces/ToRawObj";
import { ICborObj } from "./interfaces/ICborObj";
import { headerFollowingToAddInfos } from "../utils/headerFollowingToAddInfos";
import { assert } from "../utils/assert";
import { SubCborRef } from "../SubCborRef";

export interface CborMapOptions {
    indefinite?: boolean,
    addInfos?: number | undefined
}

const defaultOpts: Required<CborMapOptions> = Object.freeze({
    indefinite: false,
    addInfos: undefined as any
});

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
    implements ToRawObj, ICborObj
{
    readonly map : CborMapEntry[];
    
    readonly indefinite!: boolean;

    addInfos: number;

    constructor(
        map: CborMapEntry[],
        options?: CborMapOptions,
        public subCborRef?: SubCborRef
    )
    {
        assert(
            Array.isArray( map ) &&
            map.every( entry => (
                isObject(  entry ) &&
                isCborObj( entry.k ) &&
                isCborObj( entry.v )
            )),
            "in 'CborMap' constructor: invalid input; got: " + map
        );

        const indefinite = options?.indefinite === true ? true : defaultOpts.indefinite;
        this.addInfos = options?.addInfos ?? headerFollowingToAddInfos( map.length );
        this.map = map;
        this.indefinite = indefinite === true;
    }

    toRawObj(): RawCborMap
    {
        return {
            map: this.map.map( entry => {
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
            this.map.map( entry => ({
                k: entry.k.clone(),
                v: entry.v.clone()
            })),
            { indefinite: this.indefinite, addInfos: this.addInfos },
            this.subCborRef?.clone()
        );
    }
}