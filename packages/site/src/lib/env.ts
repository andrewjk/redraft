type Env = {
	JWT_SECRET: string;
	SITE_LOCATION: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;
};

export default function env(): Env {
	// @ts-ignore
	return (globalThis.adapter?.env ?? process.env) as Env;
}
