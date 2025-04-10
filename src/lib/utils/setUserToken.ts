import { CookieHelper } from "@torpor/build/server";

type User = {
	url: string;
	name: string;
	image: string;
	token: string;
};

export default function setUserToken(cookies: CookieHelper, user: User) {
	const value = btoa(JSON.stringify(user));
	cookies.set("jwt", value, { path: "/" });
}
