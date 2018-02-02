// This file is part of cbin, copyright (c) 2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { Endian, CEndian } from './Endian';

export const tempF64 = new Float64Array(1);
export const bufF64 = new Uint8Array(tempF64.buffer);

const empty = new Uint8Array(0);

export class Reader {

	constructor(
		public data: Uint32Array | number[] = empty,
		public endian: Endian | CEndian = CEndian.little,
		public pos = 0,
		public len = data.length
	) {}

	slow(count: number): number;
	slow(count: number, target: Uint8Array, targetPos: number, targetDelta: number): number;
	slow(count: number, target?: Uint8Array, targetPos?: any, targetDelta?: number) {
		const chunkList = this.chunkList || [];
		let data: Uint8Array | number[] | undefined = this.data;
		let pos = this.pos;
		let len = this.len;
		let result = 0;

		for(let shift = 0; shift < count; shift += 8) {
			while(pos >= len) {
				data = chunkList[this.chunkNum];
				if(!data) throw(new Error('End of input'));

				pos = 0;
				len = data.length;

				chunkList[this.chunkNum++] = void 0;
				this.data = data;
				this.len = len;
			}

			if(target) {
				target[targetPos] = data[pos++];
				targetPos += targetDelta!;
			} else if(this.endian == CEndian.little) {
				result |= data[pos++] << shift;
			} else {
				result = (result << 8) | data[pos++];
			}
		}

		this.pos = pos;

		return(result);
	}

	u8() {
		if(this.pos + 1 > this.len) return(this.slow(8));

		return(this.data[this.pos++]);
	}

	u16() {
		const data = this.data;
		const pos = this.pos;

		if(pos + 2 > this.len) return(this.slow(16));
		this.pos = pos + 2;

		return(this.endian == CEndian.little ? (
			 data[pos] | (data[pos + 1] << 8)
		) : (
			(data[pos] << 8) | data[pos + 1]
		));
	}

	u32() {
		const data = this.data;
		const pos = this.pos;

		if(pos + 4 > this.len) return(this.slow(32));
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

		if(pos + 8 > this.len) {
			if(this.endian == Endian.native) {
				this.slow(64, bufF64, 0, 1);
			} else {
				this.slow(64, bufF64, 7, -1);
			}

			return(tempF64[0]);
		}

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

		this.pos = pos + 8;
		return(tempF64[0]);
	}

	push(chunk: Uint8Array | number[]) {
		(this.chunkList || (this.chunkList = [])).push(chunk);
	}

	chunkList?: (Uint8Array | number[] | undefined)[];
	chunkNum = 0;

}
