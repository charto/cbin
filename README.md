cbin
====

[![npm version](https://img.shields.io/npm/v/cbin.svg)](https://www.npmjs.com/package/cbin)

`cbin` provides a simple interface for reading and writing binary data in JavaScript.

Features
--------

There are lots of similar implementations. The highlights of this one:

- Works in browsers and Node.js.
- Small and fast.
- Really nice API.
- Written in TypeScript.

Usage
-----

There are two classes, `Reader` and `Writer`, with 3 constructor parameters:

- `data` (required), a `Uint8Array` accessed through the class.
- `endian` (optional), one of the following values:
  - `Endian.little` (0, the default)
  - `Endian.big` (1)
  - `Endian.native` (0 or 1 depending on the system)
- `pos` (optional), the current byte position (default is 0).

The parameters become correspondingly named class members.

Accessing the members directly is fine, and the preferred way to access individual bytes.
More convenient methods are provided for longer data types:

- `u16` for unsigned 16-bit integer.
- `u32` for unsigned 32-bit integer.
- `f64` for 64-bit IEEE double precision float.

The methods on `Reader` take no parameters. On `Writer` the only parameter is the value to write.

Both methods update the `pos` member. The methods on `Writer` return `this`, which allows chaining them.

Example:

```TypeScript
const { Reader, Writer, Endian } = require('cbin');

const writer = new Writer(new Uint8Array(13), Endian.big);

writer.data[writer.pos++] = 0;
writer.u32(0x12345678).f64(-1);

// Prints: 0012345678bff0000000000000
console.log(Buffer.from(writer.data).toString('hex'));

const reader = new Reader(writer.data, Endian.big, 5);

// Prints: -1
console.log(reader.f64());
```

For TypeScript, a const enum values `CEndian.little` and `CEndian.big` are provided.
They compile to numeric constants for a tiny size and speed improvement.

License
=======

[The MIT License](https://raw.githubusercontent.com/charto/cbin/master/LICENSE)

Copyright (c) 2017 BusFaster Ltd
