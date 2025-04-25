import commentReceived from "@/lib/public/commentReceived";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await commentReceived(request);
	},
} satisfies ServerEndPoint;
