import accountSetup from "@/lib/account/accountSetup";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		return await accountSetup(request);
	},
} satisfies ServerEndPoint;
