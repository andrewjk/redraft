import type { ServerEndPoint } from "@torpor/build";
import messageReceived from "../../../lib/public/messageReceived";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await messageReceived(request);
	},
} satisfies ServerEndPoint;
