import type { ServerEndPoint } from "@torpor/build";
import commentReceived from "../../../../lib/public/commentReceived";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await commentReceived(request);
	},
} satisfies ServerEndPoint;
