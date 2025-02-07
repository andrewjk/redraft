// We will need to support S3-style content hosting at some point. I thought
// that maybe we could stub out some endpoints to handle e.g. PutObject in dev
// or self-hosted scenarios. But S3 expects that your URLs are in the format
// http://[bucket].[host]. Which obviously doesn't work with localhost! So for
// now we are just storing images in the database
import db from "@/data/db";
import { contentTable } from "@/data/schema";

//import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
//
//const S3 = new S3Client({
//	region: "auto",
//	endpoint: `${process.env.URL}api/storage`,
//	credentials: {
//		accessKeyId: "ACCESS_KEY_ID",
//		secretAccessKey: "SECRET_ACCESS_KEY",
//	},
//	requestChecksumCalculation: "WHEN_REQUIRED",
//	responseChecksumValidation: "WHEN_REQUIRED",
//});
//
//export async function uploadFile(file: File, name: string) {
//	try {
//		await S3.send(
//			new PutObjectCommand({
//				Body: file,
//				Bucket: "content",
//				Key: name,
//			}),
//		);
//	} catch (err) {
//		console.log(err);
//	}
//}
//

export async function uploadFile(file: File, name: string) {
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
