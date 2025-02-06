import followRequested from "@/lib/follow/followRequested";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return followRequested(request);
	},
} satisfies ServerEndPoint;
