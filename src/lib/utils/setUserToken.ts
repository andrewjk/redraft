type CookieUser = {
	url: string;
	name: string;
	image: string;
	token: string;
};

// TODO: Export CookieHelper from @torpor/build
export default function setUserToken(cookies: any, user: CookieUser) {
	const value = btoa(JSON.stringify(user));
	cookies.set("jwt", value, { path: "/" });
}
