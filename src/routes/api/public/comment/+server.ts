import commentReceived from "@/lib/public/commentReceived";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return commentReceived(request);
	},
} satisfies ServerEndPoint;
