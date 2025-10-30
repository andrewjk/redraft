type Env = {
	SITE_LOCATION: string;
	JWT_SECRET: string;
	JWT_SECRET_2: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;
};

export default function env(): Env {
	// @ts-ignore
	return (globalThis.adapter?.env ?? process.env) as Env;
}
