import accountRegister from "@/lib/account/accountRegister";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request, cookies }) => {
		return accountRegister(request, cookies);
	},
} satisfies ServerEndPoint;
