// This file is part of cbin, copyright (c) 2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { Writer } from './Writer';

export const enum CEndian {
	big = 0,
	little = 1
}

let nativeEndian: CEndian;
const test = new Uint32Array(1);

new Writer(new Uint8Array(test.buffer)).u32(0x01020304);

if(test[0] == 0x01020304) nativeEndian = CEndian.little;
else if(test[0] == 0x04030201) nativeEndian = CEndian.big;
else throw(new Error('Middle endian is not supported'));

export enum Endian {
	big = CEndian.big,
	little = CEndian.little,
	native = nativeEndian as number
}
