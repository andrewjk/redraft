import accountLogin from "@/lib/account/accountLogin";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request, cookies }) => {
		return accountLogin(request, cookies);
	},
} satisfies ServerEndPoint;
