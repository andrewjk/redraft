import type { ServerEndPoint } from "@torpor/build";
import followCheck from "../../../../lib/public/followCheck";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await followCheck(request);
	},
} satisfies ServerEndPoint;
