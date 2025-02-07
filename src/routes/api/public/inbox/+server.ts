import inboxReceived from "@/lib/inbox/inboxReceived";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return inboxReceived(request);
	},
} satisfies ServerEndPoint;
