type Env = {
	DB_CONNECTION: string;
	JWT_SECRET: string;
	SITE_LOCATION: string;

	// For setup
	USERNAME: string;
	PASSWORD: string;
};

export default function env(): Env {
	return process.env as Env;
}
