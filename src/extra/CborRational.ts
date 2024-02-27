
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { CborObj } from "../CborObj/CborObj";
import { CborArray } from "../CborObj/CborArray";
import { CborTag } from "../CborObj/CborTag";
import { CborUInt } from "../CborObj/CborUInt";
import { CanBeUInteger, forceBigUInt } from "../utils/ints";

export class CborPositiveRational extends CborTag
{
    readonly num!: bigint;
    readonly den!: bigint;

    constructor( num: CanBeUInteger, den: CanBeUInteger )
    {
        const _num = forceBigUInt( num )
        const _den = forceBigUInt( den )

        super(
            30,
            new CborArray([
                new CborUInt( _num ),
                new CborUInt( _den )
            ])
        );

        defineReadOnlyProperty( this, "num", _num )
        defineReadOnlyProperty( this, "den", _den )
    }

    static fromCborObjOrUndef( cObj: CborObj | undefined ): CborPositiveRational | undefined
    {
        return (
            (
                cObj instanceof CborTag && 
                cObj.data instanceof CborArray &&
                cObj.data.array[0] instanceof CborUInt &&
                cObj.data.array[1] instanceof CborUInt
            )?
            new CborPositiveRational( cObj.data.array[0].num, cObj.data.array[1].num )
            : undefined
        ); 
    }

    static fromNumber( n: number ): CborPositiveRational
    {
        const [ a, b ] = n.toString().split(".");
        /** 
         * b might be undefinded (eg. whole numbers)
         * @since patch 1.1.2
        **/
        if(!(typeof b === "string"))
        {
            return new CborPositiveRational( Number( a ), 1 );
        }
        return new CborPositiveRational(
            // `a + b` is string concatenation
            Number( a + b ),
            Number(`1e${b.length}`)
        );
    }

    toNumber(): number
    {
        return Number( this.num ) / Number( this.den );
    }

    valueOf(): number
    {
        return this.toNumber()
    }

}