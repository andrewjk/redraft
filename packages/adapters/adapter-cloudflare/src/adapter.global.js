(function(drizzle_orm_d1) {


//#region src/env.ts
	function env() {
		return globalThis.adapter.env;
	}

//#endregion
//#region src/database.ts
	function database(schema) {
		return (0, drizzle_orm_d1.drizzle)(env().DB, { schema });
	}

//#endregion
//#region src/normalizeFileName.ts
	function normalizeFileName(name) {
		const contentPath = "/api/content/";
		if (name.includes(contentPath)) name = name.substring(name.indexOf(contentPath) + 13);
		if (name.startsWith("/")) name = name.substring(1);
		return name;
	}

//#endregion
//#region src/storage.ts
	const storage = {
		uploadFile: async (file, name) => {
			await env().STORAGE.put(name, file);
		},
		deleteFile: async (name) => {
			name = normalizeFileName(name);
			await env().STORAGE.delete(name);
		},
		getFile: async (name) => {
			name = normalizeFileName(name);
			const object = await env().STORAGE.get(name);
			if (object === null) return new Response("Object Not Found", { status: 404 });
			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set("etag", object.httpEtag);
			return new Response(object.body, { headers });
		}
	};
	var storage_default = storage;

//#endregion
//#region src/images.ts
	const images = { async getImage(name, width, height) {
		let ext = name.split(".").at(-1);
		if (ext === "jpg") ext = "jpeg";
		if (!width && !height || !(ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp" || ext === "avif")) return storage_default.getFile(name);
		const format = "image/" + ext;
		name = normalizeFileName(name);
		const object = await env().STORAGE.get(name);
		if (object === null) return new Response("Object Not Found", { status: 404 });
		const stream = object.body;
		const img = env().IMAGES;
		width = Math.min(width, 1e3);
		height = Math.min(height, 1e3);
		let options = {
			width: width || void 0,
			height: height || void 0,
			fit: "cover"
		};
		return (await img.input(stream).transform(options).output({ format })).response();
	} };
	var images_default = images;

//#endregion
//#region src/transaction.ts
	async function transaction(db, fn) {
		return await fn(db);
	}

//#endregion
//#region src/adapter.ts
	var adapter_default = {
		database,
		transaction,
		storage: storage_default,
		images: images_default
	};

//#endregion
//#region src/iife.ts
	globalThis.socialAdapter = adapter_default;

//#endregion
})(drizzle_orm_d1);