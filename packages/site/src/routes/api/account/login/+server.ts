import accountLogin from "@/lib/account/accountLogin";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		return await accountLogin(request);
	},
} satisfies ServerEndPoint;
