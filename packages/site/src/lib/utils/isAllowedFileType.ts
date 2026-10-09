import { ALLOWED_FILE_TYPES } from "../constants";

/**
 * Whether an uploaded attachment's filename has an extension we allow (see
 * ALLOWED_FILE_TYPES). Checked by extension -- the MIME type is client-supplied
 * and easily spoofed.
 */
export default function isAllowedFileType(name: string): boolean {
	const dot = name.lastIndexOf(".");
	if (dot === -1) {
		return false;
	}
	return ALLOWED_FILE_TYPES.includes(name.slice(dot + 1).toLowerCase());
}
