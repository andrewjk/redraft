import type { Storage } from "@redraft/adapter-core";
import env from "./env";

const bucket = env().STORAGE;

const storage: Storage = {
	uploadFile: async (file: File, name: string): Promise<void> => {
		await bucket.put(name, file);
	},

	deleteFile: async (name: string): Promise<void> => {
		name = normalizeName(name);
		await bucket.delete(name);
	},

	getFile: async (name: string): Promise<Response> => {
		name = normalizeName(name);

		const object = await bucket.get(name);
		if (object === null) {
			return new Response("Object Not Found", { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("etag", object.httpEtag);

		return new Response(object.body, {
			headers,
		});
	},
};

function normalizeName(name: string): string {
	const contentPath = "/api/content/";
	if (name.includes(contentPath)) {
		name = name.substring(name.indexOf(contentPath) + contentPath.length);
	}
	if (name.startsWith("/")) {
		name = name.substring(1);
	}
	return name;
}

export default storage;
