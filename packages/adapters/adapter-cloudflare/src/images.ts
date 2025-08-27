import type { Images } from "@redraft/adapter-core";
import env from "./env";
import normalizeFileName from "./normalizeFileName";
import storage from "./storage";

const images: Images = {
	async getImage(name: string, width: number, height: number): Promise<Response> {
		let ext = name.split(".").at(-1);
		if (ext === "jpg") {
			ext = "jpeg";
		}

		// If there are no transformations, or it's an unsupported format, just
		// return the image from storage
		let formatOk =
			ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp" || ext === "avif";
		if ((!width && !height) || !formatOk) {
			return storage.getFile(name);
		}

		const format = ("image/" + ext) as
			| "image/jpeg"
			| "image/png"
			| "image/gif"
			| "image/webp"
			| "image/avif";

		name = normalizeFileName(name);

		const bucket = env().STORAGE;
		const object = await bucket.get(name);
		if (object === null) {
			return new Response("Object Not Found", { status: 404 });
		}

		const stream = object.body;

		const img = env().IMAGES;

		// HACK: limits
		width = Math.min(width, 1000);
		height = Math.min(height, 1000);

		let options = {
			width: width || undefined,
			height: height || undefined,
		};

		let output = await img.input(stream).transform(options).output({
			format,
		});

		return output.response();
	},
};

export default images;
