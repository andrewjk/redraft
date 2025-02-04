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
			appData.user = jose.decodeJwt(token)?.user;
		}
	},
} satisfies ServerHook;
