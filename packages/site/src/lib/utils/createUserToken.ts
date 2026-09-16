import * as jose from "jose";
import env from "../env";

type User = {
	url: string;
	username: string;
	name: string;
	image?: string;
};

/**
 * Creates a token containing the user information for logging into your site.
 * The token is signed with the site's secret, so it can be verified whenever
 * it's read back (from the cookie or headers).
 * @param user User information to create the token
 * @param code The user's token code, which is checked against the database
 * @returns the token created
 */
export default async function createUserToken(user: User, code: string) {
	if (!env().JWT_SECRET) {
		throw new Error("JWT_SECRET missing in environment.");
	}
	const tokenObject = {
		user: {
			url: user.url,
			username: user.username,
			name: user.name,
			image: user.image,
			code,
		},
	};
	const secret = new TextEncoder().encode(env().JWT_SECRET);
	const token = await new jose.SignJWT(tokenObject)
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
	return token;
}
