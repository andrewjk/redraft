import feedReceived from "@/lib/public/feedReceived";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await feedReceived(request);
	},
} satisfies ServerEndPoint;
