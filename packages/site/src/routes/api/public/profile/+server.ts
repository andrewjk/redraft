import type { ServerEndPoint } from "@torpor/build";
import profileUpdated from "../../../../lib/public/profileUpdated";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await profileUpdated(request);
	},
} satisfies ServerEndPoint;
