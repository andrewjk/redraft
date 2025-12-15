// We will need to support S3-style content hosting at some point. I thought
// that maybe we could stub out some endpoints to handle e.g. PutObject in dev
// or self-hosted scenarios. But S3 expects that your URLs are in the format
// http://[bucket].[host]. Which obviously doesn't work with localhost! So for
// now we are just storing images in the database
//
// Also, see further down for how we used to store images in the database
import type { Storage } from "@redraft/adapter-core";
import { promises as fs } from "node:fs";
import path from "node:path";
import bufferToArrayBuffer from "./bufferToArrayBuffer";

const storage: Storage = {
	uploadFile: async (file: File, name: string): Promise<void> => {
		const filename = path.resolve(`./content/${name}`);
		const content = await file.bytes();
		await fs.writeFile(filename, content);
	},

	deleteFile: async (name: string): Promise<void> => {
		// We're probably going to be passed the URL that was displayed
		const subfolder = "/api/content/";
		if (name.startsWith("http") && name.includes(subfolder)) {
			name = name.substring(name.indexOf(subfolder) + subfolder.length);
		}
		const filename = path.resolve(`./content/${name}`);
		await fs.rm(filename);
	},

	getFile: async (name: string): Promise<Response> => {
		const filename = path.resolve(`./content/${name}`);
		const content = await fs.readFile(filename);
		return new Response(bufferToArrayBuffer(content));
	},

	/*
	getStream: async (name: string): Promise<ReadableStream<any> | undefined> => {
		const filename = path.resolve(`./content/${name}`);
		const content = fs2.createReadStream(filename);
		return new Promise((res) => res(Readable.toWeb(content)));
	},
	*/
};

export default storage;

/*
import { eq } from "drizzle-orm";
import database from "../data/database";
import { contentTable } from "../data/schema";

export async function uploadFile(file: File, name: string) {
	const db = database();

	// TODO: Need error handling
	const body = await file.arrayBuffer();

	// Create the content
	const content = {
		name,
		content: body,
		type: file.type,
		created_at: new Date(),
		updated_at: new Date(),
	};

	// Insert the content into the database
	await db.insert(contentTable).values(content);
}

export async function deleteFile(name: string) {
	const db = database();
	await db.delete(contentTable).where(eq(contentTable.name, name));
}

export async function getFile(name: string) {
	const db = database();

	const content = await db.query.contentTable.findFirst({
		where: eq(contentTable.name, name),
	});
	if (!content) {
		return notFound();
	}

	return new Response(content.content as any);
}
*/
