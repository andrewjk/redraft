type Env = {
	SITE_LOCATION: string;
	JWT_SECRET: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;

	// For the database
	DB: D1Database;

	// For storage
	STORAGE: R2Bucket;

	//R2_ACCOUNT_ID: string;
	//R2_ACCESS_KEY_ID: string;
	//R2_SECRET_ACCESS_KEY: string;
	//R2_BUCKET_NAME: string;
};

export default function env(): Env {
	// Env gets sent to us and added to globalThis.adapter in the Cloudflare
	// fetch function
	// @ts-ignore
	return globalThis.adapter.env as Env;
}
