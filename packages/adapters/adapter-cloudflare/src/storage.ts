import type { Storage } from "@redraft/adapter-core";
import env from "./env";
import normalizeFileName from "./normalizeFileName";

const storage: Storage = {
	uploadFile: async (file: File, name: string): Promise<void> => {
		const bucket = env().STORAGE;
		await bucket.put(name, file);
	},

	deleteFile: async (name: string): Promise<void> => {
		name = normalizeFileName(name);
		const bucket = env().STORAGE;
		await bucket.delete(name);
	},

	getFile: async (name: string): Promise<Response> => {
		name = normalizeFileName(name);

		const bucket = env().STORAGE;
		const object = await bucket.get(name);
		if (object === null) {
			return new Response("Object Not Found", { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("ETag", object.httpEtag);

		return new Response(object.body, {
			headers,
		});
	},
};

export default storage;
