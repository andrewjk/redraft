import * as jose from "jose";

type User = {
	url: string;
	shared_key: string;
};

/**
 * Creates a token containing the user information for sending to users you
 * follow/are followed by when communicating with them. The token is signed
 * with the relationship's shared key, so the receiving site can verify it
 * without the key ever being sent.
 * @param user User information to create the token
 * @returns the token created
 */
export default async function createHeaderToken(user: User) {
	const tokenObject = {
		follower: {
			url: user.url,
		},
	};
	const secret = new TextEncoder().encode(user.shared_key);
	const token = await new jose.SignJWT(tokenObject)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.sign(secret);
	return token;
}
