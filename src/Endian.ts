// This file is part of cbin, copyright (c) 2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { Writer } from './Writer';

export enum Endian {
	big = 0,
	little = 1
}

const testEndian = new Uint32Array(1);

export let nativeEndian: Endian;

new Writer(new Uint8Array(testEndian.buffer)).u32(0x01020304);

if(testEndian[0] == 0x01020304) {
	nativeEndian = Endian.little;
} else if(testEndian[0] == 0x04030201) {
	nativeEndian = Endian.big;
} else {
	throw(new Error('Middle endian is not supported'));
}
