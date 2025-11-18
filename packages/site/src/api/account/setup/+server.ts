import type { ServerEndPoint } from "@torpor/build";
import accountSetup from "../../../lib/account/accountSetup";

export default {
	post: async ({ request }) => {
		return await accountSetup(request);
	},
} satisfies ServerEndPoint;
