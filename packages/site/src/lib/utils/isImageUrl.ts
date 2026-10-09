// Raster image extensions we render inline with an <img>. SVG is deliberately
// excluded (it can carry script), so an SVG upload is treated as a file.
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "tif", "tiff"];

/**
 * Whether a stored content URL points at an image we render inline. Posts
 * reuse the image columns for either an image or an arbitrary file, so this is
 * how the two are told apart (the stored name keeps the original extension).
 */
export default function isImageUrl(url: string | null | undefined): boolean {
	if (!url) {
		return false;
	}
	const path = url.split("?")[0].split("#")[0];
	const dot = path.lastIndexOf(".");
	if (dot === -1) {
		return false;
	}
	return IMAGE_EXTENSIONS.includes(path.slice(dot + 1).toLowerCase());
}

/** Whether an uploaded file should be treated as an image (see isImageUrl) */
export function isImageFile(file: File): boolean {
	return file.type.startsWith("image/") && !file.type.includes("svg");
}
