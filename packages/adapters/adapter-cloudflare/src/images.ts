import type { Images } from "@redraft/adapter-core";
import env from "./env";
import normalizeFileName from "./normalizeFileName";
import storage from "./storage";

const images: Images = {
	//getUrl: (url: string, height: number, width: number): string => {
	//	return url ? `https://cdn-cgi/image/height=${height},width=${width},fit=cover/${url}` : "";
	//},

	async getImage(name: string, width: number, height: number): Promise<Response> {
		// If there are no transformations, just return the image from storage
		if (!width && !height) {
			return storage.getFile(name);
		}

		name = normalizeFileName(name);

		const bucket = env().STORAGE;
		const object = await bucket.get(name);
		if (object === null) {
			return new Response("Object Not Found", { status: 404 });
		}

		//return object?.body;
		const stream = object.body;

		const img = env().IMAGES;
		const info = await img.info(stream);

		// HACK: limits
		width = Math.min(width, 1000);
		height = Math.min(height, 1000);

		const output = await img
			.input(stream)
			.transform({ width, height })
			// @ts-ignore
			.output({ format: info.format });

		return output.response();
	},
};

export default images;
