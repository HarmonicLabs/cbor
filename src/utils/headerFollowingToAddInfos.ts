import { MAX_4_BYTES, OVERFLOW_1_BYTE, OVERFLOW_2_BYTES, OVERFLOW_4_BYTES } from "../constants/max";


/**
 * 
 * @param {number} following : number immediately following the header
 * usually the payload length, or the number itself for uints and negInts
 * 
 * @returns {number} a 5 bit unsigned integer that best represents the number of bytes
 */
export function headerFollowingToAddInfos( following: number | bigint ): number
{
    if( following < 0 ) return headerFollowingToAddInfos( -following );
    if( following > MAX_4_BYTES ) return 27;

    if( following < 24 ) return Number( following );
    if( following < OVERFLOW_1_BYTE  ) return 24;
    if( following < OVERFLOW_2_BYTES ) return 25;
    if( following < OVERFLOW_4_BYTES ) return 26;
    return 27;
}