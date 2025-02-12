import feedReceived from "@/lib/public/feedReceived";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return feedReceived(request);
	},
} satisfies ServerEndPoint;
