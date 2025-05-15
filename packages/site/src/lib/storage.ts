// We will need to support S3-style content hosting at some point. I thought
// that maybe we could stub out some endpoints to handle e.g. PutObject in dev
// or self-hosted scenarios. But S3 expects that your URLs are in the format
// http://[bucket].[host]. Which obviously doesn't work with localhost! So for
// now we are just storing images in the database
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
