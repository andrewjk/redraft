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

		// NOTE: We were originally using cookies for logging in to the sites of
		// users that you follow, but it had some drawbacks:
		//   * required a lot of logging in
		//   * confusing when cookies expired
		//   * sometimes the way to log in wasn't easy to find
		//   * would require us to save following records in the host site
		// So we moved to sending a header via the browser extension

		//// Decode the follower token, if it exists
		//const fjwt = cookies.get("fjwt");
		//try {
		//	appData.follower = fjwt ? JSON.parse(atob(fjwt)) : null;
		//} catch {
		//	cookies.delete("fjwt", { path: "/" });
		//}

		// Or the follower header, if it exists
		if (!appData.follower) {
			const headerToken = request.headers.get("x-social-follower");
			if (headerToken) {
				appData.follower = jose.decodeJwt(headerToken).follower;
				appData.follower.token = headerToken;
			}
		}
	},
} satisfies ServerHook;
