import type { ServerEndPoint } from "@torpor/build";
import unfollowRequested from "../../../../../lib/public/unfollowRequested";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await unfollowRequested(request);
	},
} satisfies ServerEndPoint;
