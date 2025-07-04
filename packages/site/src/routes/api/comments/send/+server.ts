import type { ServerEndPoint } from "@torpor/build";
import commentSend from "../../../../lib/comments/commentSend";

export default {
	post: async ({ request }) => {
		// HACK: We don't have a user, this gets called when a follower creates a comment...
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await commentSend(request);
	},
} satisfies ServerEndPoint;
