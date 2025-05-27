// We were using the S3 compatible access to R2
// I'm leaving it here for when we make an AWS adapter

/*
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import type { Storage } from "@redraft/adapter-core";
import env from "./env";

const bucket = env().R2_BUCKET_NAME;

const S3 = new S3Client({
	region: "auto",
	endpoint: `https://${env().R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env().R2_ACCESS_KEY_ID,
		secretAccessKey: env().R2_SECRET_ACCESS_KEY,
	},
	requestChecksumCalculation: "WHEN_REQUIRED",
	responseChecksumValidation: "WHEN_REQUIRED",
});

const storage: Storage = {
	uploadFile: async (file: File, name: string): Promise<void> => {
		await S3.send(
			new PutObjectCommand({
				Body: file,
				Bucket: bucket,
				Key: name,
			}),
		);
	},

	deleteFile: async (name: string): Promise<void> => {
		const contentPath = "/api/content/";
		if (name.includes(contentPath)) {
			name = name.substring(name.indexOf(contentPath) + contentPath.length);
		}
		if (name.startsWith("/")) {
			name = name.substring(1);
		}
		await S3.send(
			new DeleteObjectCommand({
				Bucket: bucket,
				Key: name,
			}),
		);
	},

	getFile: async (name: string): Promise<Response> => {
		const stream = (
			await S3.send(new GetObjectCommand({ Bucket: bucket, Key: name }))
		).Body?.transformToWebStream();
		return new Response(stream);
	},
};

export default storage;
*/
