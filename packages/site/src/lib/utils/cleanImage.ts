// NOTE: This clears EXIF data from JPEG image files. It doesn't clear EXIF data
// from PNG, TIF or HEIF files. iPhone photos are saved as HEIF files, but
// converted to JPEG when used, so we shouldn't need to handle the HEIF format
// just yet. Maybe one day though!

// See https://www.media.mit.edu/pia/Research/deepview/exif.html for more info
const EXIF_MARKER = 0xffe1;
const STREAM_MARKER = 0xffda;
const EXIF_HEADER = "Exif\0\0";
const BIG_ENDIAN_MARKER = 0x4d4d;
const LITTLE_ENDIAN_MARKER = 0x4949;
const TIFF_MARKER = 0x002a;
const TABLE_ENTRY_SIZE = 12;

// Keep orientation and TODO: allow keeping copyright etc
const TAGS_TO_KEEP = [0x0112];

// Adapted from https://stackoverflow.com/a/77472484
export default function cleanImage(file: File): Promise<File> {
	return new Promise((resolve) => {
		if (file && file.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = () => {
				const cleanedBuffer = cleanBuffer(reader.result as ArrayBuffer);
				const blob = new Blob([cleanedBuffer], { type: file.type });
				const newFile = new File([blob], file.name, { type: file.type });
				resolve(newFile);
			};
			reader.readAsArrayBuffer(file);
		} else {
			resolve(file);
		}
	});
}

function cleanBuffer(arrayBuffer: ArrayBuffer) {
	let dataView = new DataView(arrayBuffer);
	let offset = 2; // Skip the first two bytes (0xFFD8)

	while (offset < dataView.byteLength) {
		const marker = dataView.getUint16(offset);
		const length = dataView.getUint16(offset + 2, false) + 2;
		if (marker === EXIF_MARKER) {
			// Read the tags and get the replacement tags if any exist
			const replacement = readExifTags(dataView, offset);

			// Update the arrayBuffer and dataView to remove the metadata
			arrayBuffer = removeSegment(arrayBuffer, offset, length, replacement);
			dataView = new DataView(arrayBuffer);

			if (replacement !== null) {
				offset += replacement.length;
			}
		} else if (marker === STREAM_MARKER) {
			// No more metadata
			break;
		} else {
			// Move to the next marker
			offset += length;
		}
	}

	return arrayBuffer;
}

function removeSegment(
	buffer: ArrayBuffer,
	offset: number,
	length: number,
	replacement: Uint8Array | null,
) {
	// Create a modified buffer without the specified segment
	const replacementLength = replacement?.length ?? 0;
	const modified = new Uint8Array(buffer.byteLength - length + replacementLength);
	modified.set(new Uint8Array(buffer.slice(0, offset)), 0);
	if (replacement !== null) {
		modified.set(replacement, offset);
	}
	modified.set(new Uint8Array(buffer.slice(offset + length)), offset + replacementLength);
	return modified.buffer;
}

// Adapted from https://jsdev.space/howto/javascript-exif-parser/
function readExifTags(dataView: DataView, start: number): Uint8Array | null {
	// Check for "Exif\0\0" header
	const exifHeaderOffset = start + 4;
	const exifHeaderChars = [];
	for (let i = 0; i < 6; i++) {
		exifHeaderChars.push(dataView.getUint8(exifHeaderOffset + i));
	}
	if (String.fromCharCode(...exifHeaderChars) !== EXIF_HEADER) {
		//console.log("Invalid EXIF data: found", String.fromCharCode(...exifHeaderChars));
		return null;
	}

	// Offsets are measured from after the header
	const exifContentOffset = exifHeaderOffset + EXIF_HEADER.length;

	// Determine endianness
	let littleEndian: boolean;
	if (dataView.getUint16(exifContentOffset) === LITTLE_ENDIAN_MARKER) {
		littleEndian = true;
	} else if (dataView.getUint16(exifContentOffset) === BIG_ENDIAN_MARKER) {
		littleEndian = false;
	} else {
		//console.log("Invalid TIFF data: endianness marker not found");
		return null;
	}

	// Check for TIFF marker
	if (dataView.getUint16(exifContentOffset + 2, littleEndian) !== TIFF_MARKER) {
		//console.log("Invalid TIFF data: TIFF marker not found");
		return null;
	}

	// Get offset to first IFD (Image File Directory)
	const firstIFDOffset = dataView.getUint32(exifContentOffset + 4, littleEndian);

	// Read the main IFD
	const ifdData = readIFD(
		dataView,
		exifContentOffset,
		exifContentOffset + firstIFDOffset,
		littleEndian,
	);

	// NOTE: We don't care about anything in sub-IFDs (for now?)

	// If any of the tags we want to keep were found, create and return a new EXIF section
	const exifEntryCount = Object.keys(ifdData).length;
	if (exifEntryCount > 0) {
		// HACK: Probably a more efficient way to do this with DataView
		let rdata: number[] = [];
		pushUint16(rdata, EXIF_MARKER);
		pushUint16(rdata, 0); // Length -- will get set at the end
		rdata.push(...exifHeaderChars);
		pushUint16(rdata, littleEndian ? LITTLE_ENDIAN_MARKER : BIG_ENDIAN_MARKER);
		pushUint16(rdata, TIFF_MARKER, littleEndian);
		pushUint32(rdata, 0x08, littleEndian); // Offset to table, immediately after this
		pushUint16(rdata, exifEntryCount, littleEndian);
		// Offset data starts after the end of the table
		let offsetData: number[] = [];
		let tableEndOffset =
			start + rdata.length + exifEntryCount * TABLE_ENTRY_SIZE + 4 - exifContentOffset;
		for (let tagNumber of TAGS_TO_KEEP) {
			const data = ifdData[tagNumber];
			if (data !== undefined) {
				pushUint16(rdata, tagNumber, littleEndian);
				pushUint16(rdata, data.dataType, littleEndian);
				pushUint32(rdata, data.numValues, littleEndian);
				if (data.totalSize <= 4) {
					// It's inline data
					pushUint32(rdata, data.valueOffset, littleEndian);
				} else {
					// It's offset data
					pushUint32(rdata, tableEndOffset, littleEndian);
					offsetData.push(...data.tagValue);
					tableEndOffset += data.numValues;
				}
			}
		}
		pushUint32(rdata, 0, littleEndian); // End of tables
		// Add the offset data
		rdata.push(...offsetData);
		// Now we can set the length
		let lengthParts: number[] = [];
		pushUint16(lengthParts, rdata.length - 2);
		rdata[2] = lengthParts[0];
		rdata[3] = lengthParts[1];
		return new Uint8Array(rdata);
	}

	return null;
}

interface ExifEntry {
	dataType: number;
	numValues: number;
	valueOffset: number;
	totalSize: number;
	tagValue: number[];
}

function readIFD(
	dataView: DataView,
	exifContentOffset: number,
	offset: number,
	littleEndian: boolean,
): Record<PropertyKey, ExifEntry> {
	const result: Record<PropertyKey, ExifEntry> = {};
	const numEntries = dataView.getUint16(offset, littleEndian);

	for (let i = 0; i < numEntries; i++) {
		const entryOffset = offset + 2 + i * TABLE_ENTRY_SIZE;
		const tagNumber = dataView.getUint16(entryOffset, littleEndian);

		// Only store the things we're interested in
		if (!TAGS_TO_KEEP.includes(tagNumber)) {
			continue;
		}

		const dataType = dataView.getUint16(entryOffset + 2, littleEndian);
		const numValues = dataView.getUint32(entryOffset + 4, littleEndian);
		const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);

		// Get tag value
		let tagValue;
		const totalSize = getDataTypeSize(dataType) * numValues;

		if (totalSize <= 4) {
			// Value is stored in the offset field itself
			tagValue = readTagValue(dataView, entryOffset + 8, numValues);
		} else {
			// Value is stored at the specified offset
			tagValue = readTagValue(dataView, exifContentOffset + valueOffset, numValues);
		}

		result[tagNumber] = { dataType, numValues, valueOffset, totalSize, tagValue };
	}

	return result;
}

function getDataTypeSize(dataType: number) {
	switch (dataType) {
		case 1:
			return 1; // BYTE
		case 2:
			return 1; // ASCII
		case 3:
			return 2; // SHORT
		case 4:
			return 4; // LONG
		case 5:
			return 8; // RATIONAL
		case 6:
			return 1; // SBYTE
		case 7:
			return 1; // UNDEFINED
		case 8:
			return 2; // SSHORT
		case 9:
			return 4; // SLONG
		case 10:
			return 8; // SRATIONAL
		case 11:
			return 4; // FLOAT
		case 12:
			return 8; // DOUBLE
		default:
			return 0;
	}
}

function readTagValue(dataView: DataView, offset: number, numValues: number) {
	let values: number[] = [];
	for (let i = 0; i < numValues; i++) {
		values.push(dataView.getUint8(offset + i));
	}
	return values;
}

function pushUint16(array: number[], number: number, littleEndian = false) {
	array.length += 2;
	for (let i = 0; i < 2; i++) {
		let index = littleEndian ? array.length - 2 + i : array.length - 1 - i;
		array[index] = number % 256;
		number = Math.floor(number / 256);
	}
}

function pushUint32(array: number[], number: number, littleEndian = false) {
	array.length += 4;
	for (let i = 0; i < 4; i++) {
		let index = littleEndian ? array.length - 4 + i : array.length - 1 - i;
		array[index] = number % 256;
		number = Math.floor(number / 256);
	}
}
