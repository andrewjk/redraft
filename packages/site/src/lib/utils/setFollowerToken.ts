import { CookieHelper } from "@torpor/build/server";

type Follower = {
	url: string;
	name: string;
	image: string;
	token: string;
};

export default function setFollowerToken(cookies: CookieHelper, follower: Follower) {
	const value = btoa(JSON.stringify(follower));
	cookies.set("fjwt", value, { path: "/", sameSite: "none", secure: true });
}
