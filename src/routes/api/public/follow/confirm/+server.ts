import followConfirmed from "@/lib/public/followConfirmed";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await followConfirmed(request);
	},
} satisfies ServerEndPoint;
