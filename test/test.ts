import { Reader, Writer, Endian } from '..';

const writer = new Writer(new Uint8Array(13), Endian.big);

writer.data[writer.pos++] = 0;
writer.u32(0x12345678).f64(-1);

// Prints: 0012345678bff0000000000000
console.log(Buffer.from(writer.data).toString('hex'));

let reader = new Reader(writer.data, Endian.big, 5);

// Prints: -1
console.log(reader.f64());

reader = new Reader();

for(let i = 4; i >= 1; --i) {
	reader.push([ writer.data[i] ]);
}

// Prints: 12345678
console.log(reader.u32().toString(16));

try {
	reader.u8();
} catch(e) {
	console.log('OK');
}
