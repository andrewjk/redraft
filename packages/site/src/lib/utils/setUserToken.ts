import { CookieHelper } from "@torpor/build/server";
import createUserToken from "./createUserToken";

type User = {
	url: string;
	username: string;
	name: string;
	image: string;
	code: string;
};

/**
 * Sets the logged in user's token in a cookie. The cookie contains a JWT
 * signed by this site, so it can be verified when it's read back.
 */
export default async function setUserToken(cookies: CookieHelper, user: User) {
	const token = await createUserToken(user, user.code);
	cookies.set("jwt", token, { path: "/" });
}
