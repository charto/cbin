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

	private consumeChunks(pos: number) {
		const chunkList = this.chunkList || [];
		const chunkCount = chunkList.length;
		let chunkNum = this.chunkNum;
		let data: Uint8Array | number[] | undefined = empty;
		let len = this.len;

		while(pos >= len) {
			this.chunkOffset += len;
			pos -= len;

			data = chunkList[chunkNum] || empty;
			len = data.length;

			this.futureLen -= len;

			if(chunkNum >= chunkCount) break;

			// Free memory used by consumed chunks.
			chunkList[chunkNum++] = void 0;
		}

		this.chunkNum = chunkNum;
		this.data = data;
		this.len = len;

		return(pos);
	}

	skip(bytes: number) {
		let pos = this.pos + bytes;

		if(pos > this.len) {
			pos = this.consumeChunks(pos);
			if(pos > this.len) throw(new Error('End of input'));
		}

		this.pos = pos;
	}

	slow(count: number): number;
	slow(count: number, target: Uint8Array, targetPos: number, targetDelta: number): number;
	slow(count: number, target?: Uint8Array, targetPos?: any, targetDelta?: number) {
		const chunkList = this.chunkList || [];
		let data: Uint8Array | number[] | undefined = this.data;
		let { pos, len } = this;
		let result = 0;

		for(let shift = 0; shift < count; shift += 8) {
			if(pos >= len) {
				pos = this.consumeChunks(pos);
				len = this.len;
				data = this.data;

				if(pos >= len) throw(new Error('End of input'));
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
		this.futureLen += chunk.length;
	}

	futureLen = 0;

	chunkList?: (Uint8Array | number[] | undefined)[];
	chunkNum = 0;
	chunkOffset = 0;

}
