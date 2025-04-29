import type { ServerEndPoint } from "@torpor/build";
import accountLogin from "../../../../lib/account/accountLogin";

export default {
	post: async ({ request }) => {
		return await accountLogin(request);
	},
} satisfies ServerEndPoint;
