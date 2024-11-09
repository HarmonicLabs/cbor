/** Lowest value that can be encoded directly as (negative) integer */
export const minBigInt = BigInt("-18446744073709551616"); // -(2n ** 64n)
/** Highest value that can be encoded directly as (positive) integer */
export const maxBigInt = BigInt("18446744073709551615");  // (2n ** 64n) - 1n

export const MAX_4_BYTES = 0b11111111_11111111_11111111_11111111;

export const OVERFLOW_1_BYTE = 0x100;
export const OVERFLOW_2_BYTES = 0x10000;
export const OVERFLOW_4_BYTES = 0x100000000;

export const MAX_1_BYTE = 0b11111111;