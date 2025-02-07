import followCheck from "@/lib/follow/followCheck";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return followCheck(request);
	},
} satisfies ServerEndPoint;
