import accountLogin from "@/lib/account/accountLogin";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		return accountLogin(request);
	},
} satisfies ServerEndPoint;
