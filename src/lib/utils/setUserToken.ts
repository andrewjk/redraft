import { CookieHelper } from "@torpor/build/server";

type User = {
	url: string;
	name: string;
	image: string;
	// TODO: Ditch this??
	token: string;
	code: string;
};

export default function setUserToken(cookies: CookieHelper, user: User) {
	const value = btoa(JSON.stringify(user));
	cookies.set("jwt", value, { path: "/" });
}
