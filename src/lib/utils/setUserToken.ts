type User = {
	email: string;
	name: string;
	image: string;
	token: string;
};

// TODO: Export CookieHelper from @torpor/build
export default function setUserToken(cookies: any, user: User) {
	const value = btoa(JSON.stringify(user));
	cookies.set("jwt", value, { path: "/" });
}
