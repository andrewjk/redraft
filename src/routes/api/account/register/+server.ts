import accountRegister from "@/lib/account/accountRegister";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		return await accountRegister(request);
	},
} satisfies ServerEndPoint;
