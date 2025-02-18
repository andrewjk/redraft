import followRequested from "@/lib/public/followRequested";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await followRequested(request);
	},
} satisfies ServerEndPoint;
