import * as jose from "jose";
import env from "../env";

type User = {
	url: string;
	shared_key: string;
};

/**
 * Creates a token containing the user information for sending to users you
 * follow/are followed by when communicating with them.
 * @param user User information to create the token
 * @returns the token created
 */
export default async function createHeaderToken(user: User) {
	if (!env().JWT_SECRET_2) {
		throw new Error("JWT_SECRET_2 missing in environment.");
	}
	const tokenObject = { follower: { url: user.url, shared_key: user.shared_key } };
	const secret = new TextEncoder().encode(env().JWT_SECRET_2);
	const token = await new jose.SignJWT(tokenObject)
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
	return token;
}
