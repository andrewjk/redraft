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

		// Decode the follower header, if it exists
		if (!appData.user && !appData.follower) {
			const headerToken = request.headers.get("X-Social-Follower");
			if (headerToken) {
				appData.follower = jose.decodeJwt(headerToken).follower;
				appData.follower.token = headerToken;
			}
		}

		// NOTE: We also allow the browser extension to send a user header, so
		// that the user only has to log in/out with the browser extension, and
		// not juggle multiple log in/out points (which may be a security risk?)

		// Decode the user header, if it exists
		if (!appData.user) {
			const headerToken = request.headers.get("X-Social-User");
			if (headerToken) {
				appData.user = jose.decodeJwt(headerToken).user;
				appData.user.token = headerToken;
			}
		}
	},
} satisfies ServerHook;
