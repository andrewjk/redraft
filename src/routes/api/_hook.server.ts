import type { ServerHook } from "@torpor/build";
import * as jose from "jose";

export default {
	handle: ({ appData, request }) => {
		const authorization = request.headers.get("authorization");
		if (!authorization) {
			return;
		}
		if (authorization.split(" ").length != 2) {
			return;
		}
		const [tag, token] = authorization.split(" ");
		if (tag === "Token" || tag === "Bearer") {
			const decoded = jose.decodeJwt(token);
			if (decoded?.user) {
				appData.user = decoded.user;
				// HACK: Not sure if this is good, but we need to set the token so
				// we can call api methods from api methods
				appData.user.token = token;
			} else if (decoded?.follower) {
				appData.follower = decoded.follower;
				// HACK: Not sure if this is good, but we need to set the token so
				// we can call api methods from api methods
				appData.follower.token = token;
			}
		}
	},
} satisfies ServerHook;
