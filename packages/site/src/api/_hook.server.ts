import type { ServerHook } from "@torpor/build";
import * as jose from "jose";
import env from "../lib/env";

export default {
	enter: async ({ appData, request, headers }) => {
		// The API can be accessed from anywhere
		// Which means we need to make sure it's secure!
		headers.set("Access-Control-Allow-Origin", "*");

		const authorization = request.headers.get("Authorization");
		if (!authorization || authorization.split(" ").length !== 2) {
			return;
		}
		const [tag, token] = authorization.split(" ");
		if (tag === "Token" || tag === "Bearer") {
			// Verify user tokens with our own secret
			try {
				const secret = new TextEncoder().encode(env().JWT_SECRET);
				const { payload } = await jose.jwtVerify(token, secret);
				if (payload.user) {
					appData.user = { ...payload.user, token };
				}
			} catch {
				// Ignore invalid user tokens
			}

			// TODO: Follower tokens are signed by the follower's site, so they
			// can't be verified with our secret. They should be signed with the
			// relationship's shared key instead (see SECURITY.md)
			const decoded = jose.decodeJwt(token);
			if (decoded?.follower) {
				appData.follower = { ...decoded.follower, token };
			}
		}
	},
} satisfies ServerHook<"/api">;
