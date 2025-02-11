//import * as dotenv from "dotenv";
import * as jose from "jose";

type User = {
	url: string;
};

//dotenv.config();

/**
 * Creates a token containing the user information for future authorization.
 * @param user User information to create the token
 * @returns the token created
 */
export default async function createFollowerToken(user: User) {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET missing in environment.");
	}
	const tokenObject = { user: { url: user.url } };
	//const userJSON = JSON.stringify(tokenObject);
	//const token = jwt.sign(userJSON, process.env.JWT_SECRET);
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	const token = await new jose.SignJWT(tokenObject)
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
	return token;
}
