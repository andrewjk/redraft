import type { ServerHook } from "@torpor/build";
import * as jose from "jose";

export default {
	handle: ({ appData, cookies, request }) => {
		// Decode the user token, if it exists
		const jwt = cookies.get("jwt");
		try {
			appData.user = jwt ? JSON.parse(atob(jwt)) : null;
		} catch {
			// Just delete the cookie if it has some bad data in it, and then
			// the user can log back in
			cookies.delete("jwt", { path: "/" });
		}

		// Decode the follower token, if it exists
		const fjwt = cookies.get("fjwt");
		try {
			appData.follower = fjwt ? JSON.parse(atob(fjwt)) : null;
		} catch {
			cookies.delete("fjwt", { path: "/" });
		}

		// Or the follower header, if it exists
		//if (!appData.follower) {
		//const fjwtHeader = request.headers.get("x-social-follower");
		//if (fjwtHeader) {
		//	//appData.follower = JSON.parse(atob(fjwtHeader));
		//	const decoded = jose.decodeJwt(fjwtHeader);
		//
		//	console.log("GOT FOLLOWER", decoded);
		//}
		//}
	},
} satisfies ServerHook;
