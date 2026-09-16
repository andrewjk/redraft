import type { ServerHook } from "@torpor/build";
import * as jose from "jose";
import env from "../lib/env";

function userSecret() {
	return new TextEncoder().encode(env().JWT_SECRET);
}

export default {
	enter: async ({ appData, cookies, request }) => {
		// Verify the user token, if it exists
		const jwt = cookies.get("jwt");
		try {
			if (jwt) {
				const { payload } = await jose.jwtVerify(jwt, userSecret());
				if (payload.user) {
					appData.user = { ...payload.user, token: jwt };
				} else {
					appData.user = null;
				}
			} else {
				appData.user = null;
			}
		} catch {
			// Just delete the cookie if it has some bad data in it, and then
			// the user can log back in
			cookies.delete("jwt", { path: "/" });
			appData.user = null;
		}

		// NOTE: We were originally using cookies for logging in to the sites of
		// users that you follow, but it had some drawbacks:
		//   * required a lot of logging in
		//   * confusing when cookies expired
		//   * sometimes the way to log in wasn't easy to find
		//   * would require us to save following records in the host site
		// So we moved to sending a header via the browser extension

		// Verify the follower header, if it exists
		if (!appData.user && !appData.follower) {
			const headerToken = request.headers.get("X-Social-Follower");
			if (headerToken) {
				// TODO: The follower token is signed by the follower's site, so
				// it can't be verified with our secret. It should be signed with
				// the relationship's shared key instead (see SECURITY.md)
				appData.follower = jose.decodeJwt(headerToken).follower;
				appData.follower.token = headerToken;
			}
		}

		// NOTE: We also allow the browser extension to send a user header, so
		// that the user only has to log in/out with the browser extension, and
		// not juggle multiple log in/out points (which may be a security risk?)

		// Verify the user header, if it exists
		if (!appData.user) {
			const headerToken = request.headers.get("X-Social-User");
			if (headerToken) {
				try {
					const { payload } = await jose.jwtVerify(headerToken, userSecret());
					if (payload.user) {
						appData.user = { ...payload.user, token: headerToken };
					}
				} catch {
					// Ignore invalid tokens
				}
			}
		}
	},
} satisfies ServerHook;
