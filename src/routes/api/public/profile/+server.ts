import profileUpdated from "@/lib/public/profileUpdated";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return profileUpdated(request);
	},
} satisfies ServerEndPoint;
