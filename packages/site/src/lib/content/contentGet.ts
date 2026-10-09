import { notFound, serverError } from "@torpor/build/response";
import images from "../images";
import getErrorMessage from "../utils/getErrorMessage";

// Raster image types we render inline. Anything else (PDF, XLSX, ZIP, but also
// SVG/HTML) is served as an opaque download -- never as a renderable type on
// our origin, so an uploaded file can't become stored XSS.
const IMAGE_TYPES: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
	avif: "image/avif",
	bmp: "image/bmp",
	ico: "image/x-icon",
	tif: "image/tiff",
	tiff: "image/tiff",
};

export default async function contentGet(name: string, query: Record<string, string>) {
	try {
		// The name is a single path segment; refuse anything that could escape
		// the content folder before touching the filesystem
		if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
			return notFound();
		}

		const img = images();

		// If we received `?s=`, then width and height are that value
		// Otherwise, use the optional `?w=` and `?h=` query params
		const width = parseInt(query.s || query.w || query.h || "0");
		const height = parseInt(query.s || query.h || query.w || "0");

		const response = await img.getImage(name, width, height);

		const ext = name.split(".").at(-1)?.toLowerCase() ?? "";
		const imageType = IMAGE_TYPES[ext];

		response.headers.set("X-Content-Type-Options", "nosniff");
		if (imageType) {
			response.headers.set("Content-Type", imageType);
		} else {
			// Forces a download instead of letting the browser render it on our
			// origin (e.g. an uploaded .html or .svg would otherwise run scripts)
			response.headers.set("Content-Type", "application/octet-stream");
			response.headers.set(
				"Content-Disposition",
				`attachment; filename="${name.replace(/["\\]/g, "")}"`,
			);
		}

		return response;
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
