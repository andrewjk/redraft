type Env = {
	DB: D1Database;
	JWT_SECRET: string;
	SITE_LOCATION: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;
};

export default function env(): Env {
	// Env gets sent to us and added to globalThis.adapter in the Cloudflare
	// fetch function
	// @ts-ignore
	return globalThis.adapter.env as Env;
}
