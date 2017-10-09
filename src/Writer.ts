// This file is part of cbin, copyright (c) 2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { Endian, nativeEndian } from './Endian';
import { tempF64, bufF64 } from './Reader';

export class Writer {

	constructor(public data: Uint8Array, public endian = Endian.little, public pos = 0) {}

	u32(num: number) {
		const data = this.data;
		let pos = this.pos;

		if(this.endian == Endian.little) {
			data[pos++] = num;
			data[pos++] = num >> 8;
			data[pos++] = num >> 16;
			data[pos++] = num >> 24;
		} else {
			data[pos++] = num >> 24;
			data[pos++] = num >> 16;
			data[pos++] = num >> 8;
			data[pos++] = num;
		}

		this.pos = pos;
		return(this);
	}

	f64(num: number) {
		const data = this.data;
		let pos = this.pos;

		tempF64[0] = num;

		if(this.endian == nativeEndian) {
			data.set(bufF64, pos);
			return(pos + 8);
		} else {
			data[pos++] = bufF64[7];
			data[pos++] = bufF64[6];
			data[pos++] = bufF64[5];
			data[pos++] = bufF64[4];
			data[pos++] = bufF64[3];
			data[pos++] = bufF64[2];
			data[pos++] = bufF64[1];
			data[pos++] = bufF64[0];
			return(pos);
		}
	}
}
