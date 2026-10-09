type Env = {
	SITE_LOCATION: string;
	JWT_SECRET: string;
	JWT_SECRET_2: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;

	/** Maximum upload size, in megabytes (defaults to 10) */
	MAX_UPLOAD_SIZE?: string;
};

export default function env(): Env {
	// @ts-ignore
	return (globalThis.adapter?.env ?? process.env) as Env;
}

/** Default maximum upload size, in megabytes */
const DEFAULT_MAX_UPLOAD_MB = 10;

/**
 * The maximum size of an uploaded image or file, in bytes. Set `MAX_UPLOAD_SIZE`
 * (in megabytes) to allow bigger uploads.
 */
export function maxUploadSize(): number {
	const megabytes = Number(env().MAX_UPLOAD_SIZE);
	return (
		(Number.isFinite(megabytes) && megabytes > 0 ? megabytes : DEFAULT_MAX_UPLOAD_MB) * 1024 * 1024
	);
}
