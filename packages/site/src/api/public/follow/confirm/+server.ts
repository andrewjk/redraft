import type { ServerEndPoint } from "@torpor/build";
import followConfirmed from "../../../../lib/public/followConfirmed";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await followConfirmed(request);
	},
} satisfies ServerEndPoint;
