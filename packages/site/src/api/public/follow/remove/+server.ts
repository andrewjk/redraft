import type { ServerEndPoint } from "@torpor/build";
import followRemoved from "../../../../lib/public/followRemoved";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await followRemoved(request);
	},
} satisfies ServerEndPoint;
