type User = {
	url: string;
	token: string;
	username: string;
	name: string;
	image: string;
};

// TODO: Export CookieHelper from @torpor/build
export default function setFollowerToken(cookies: any, user: User) {
	const value = btoa(JSON.stringify(user));
	cookies.set("fjwt", value, { path: "/", sameSite: "none", secure: true });
}
