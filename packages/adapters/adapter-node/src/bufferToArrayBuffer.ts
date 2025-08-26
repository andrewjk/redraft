// From https://stackoverflow.com/a/79345620
// No idea why it is needed
export default function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	) as ArrayBuffer;
}
