import type { ServerEndPoint } from "@torpor/build";
import feedDeleted from "../../../../lib/public/feedDeleted";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await feedDeleted(request);
	},
} satisfies ServerEndPoint;
