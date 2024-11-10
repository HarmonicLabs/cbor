import { Cbor } from "../../Cbor";
import { CborMap } from "../CborMap";

test("0 elem, indefinite", () => {
        
    const str = "bfff";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(0);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});

test("1 elem, 0 byte header", () => {
    
    const str = "a1616101";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(1);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});

test("1 elem, 1 byte", () => {
        
    const str = "b801616101";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(1);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});

test("1 elems, 2 byte header", () => {
    
    const str = "b90001616101";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(1);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});

test("1 elems, 4 bytes", () => {
        
    const str = "ba00000001616101";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(1);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});

test("1 elems, 8 bytes", () => {
            
    const str = "bb0000000000000001616101";
    const parsed = Cbor.parse(str) as CborMap;

    expect(parsed instanceof CborMap).toBe(true);
    expect(parsed.map.length).toBe(1);

    expect(
        Cbor.encode(parsed).toString()
    ).toEqual(str);
});