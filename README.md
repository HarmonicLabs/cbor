# CBOR (Concise Binary Object Representation)

[Specification](https://datatracker.ietf.org/doc/html/rfc7049)

## Installation

```bash
npm install @harmoniclabs/cbor
```

## Getting started

```ts
import { Cbor, CborText } from "@harmoniclabs/cbor";

const input = "6B68656C6C6F20776F726C64";

const cborObj = Cbor.parse( input );

if( cborObj instanceof CborText )
{
    console.log( cborObj.text ) // prints "hello world"
}

const encoded = Cbor.encode( cborObj ).toString();

console.log( encoded ) // prints "6b68656c6c6f20776f726c64" (lower case hex)

```