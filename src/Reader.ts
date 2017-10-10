// This file is part of cbin, copyright (c) 2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { Endian, CEndian } from './Endian';

export const tempF64 = new Float64Array(1);
export const bufF64 = new Uint8Array(tempF64.buffer);

export class Reader {

	constructor(public data: Uint8Array, public endian: Endian | CEndian = CEndian.little, public pos = 0) {}

	u16() {
		const data = this.data;
		let pos = this.pos;
		this.pos = pos + 4;

		return(this.endian == CEndian.little ? (
			 data[pos] | (data[pos + 1] << 8)
		) : (
			(data[pos] << 8) | data[pos + 1]
		));
	}

	u32() {
		const data = this.data;
		let pos = this.pos;
		this.pos = pos + 4;

		return(this.endian == CEndian.little ? (
			 data[pos] |
			(data[pos + 1] << 8)  |
			(data[pos + 2] << 16) |
			(data[pos + 3] << 24)
		) : (
			(data[pos] << 24) |
			(data[pos + 1] << 16) |
			(data[pos + 2] << 8)  |
			 data[pos + 3]
		));
	}

	f64() {
		const data = this.data;
		let pos = this.pos;
		this.pos = pos + 8;

		if(this.endian == Endian.native) {
			bufF64[0] = data[pos];
			bufF64[1] = data[++pos];
			bufF64[2] = data[++pos];
			bufF64[3] = data[++pos];
			bufF64[4] = data[++pos];
			bufF64[5] = data[++pos];
			bufF64[6] = data[++pos];
			bufF64[7] = data[++pos];
		} else {
			bufF64[7] = data[pos];
			bufF64[6] = data[++pos];
			bufF64[5] = data[++pos];
			bufF64[4] = data[++pos];
			bufF64[3] = data[++pos];
			bufF64[2] = data[++pos];
			bufF64[1] = data[++pos];
			bufF64[0] = data[++pos];
		}

		return(tempF64[0]);
	}

}
