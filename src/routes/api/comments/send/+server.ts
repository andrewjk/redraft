import commentSend from "@/lib/comments/commentSend";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		// HACK: We don't have a user, this gets called when a follower creates a comment...
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return commentSend(request);
	},
} satisfies ServerEndPoint;
