import accountRegister from "@/lib/account/accountRegister";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		return accountRegister(request);
	},
} satisfies ServerEndPoint;
