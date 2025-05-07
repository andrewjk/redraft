//import type { ServerEndPoint } from "@torpor/build";
//import { redirect, unauthorized } from "@torpor/build/response";
//import followerLogin from "../../../../lib/public/followerLogin";
//
//export default {
//	get: async ({ url, cookies }) => {
//		const sharedKey = url.searchParams.get("sharedkey");
//		if (!sharedKey) {
//			return unauthorized();
//		}
//
//		followerLogin(sharedKey, cookies);
//
//		return redirect("/");
//	},
//} satisfies ServerEndPoint;
//
