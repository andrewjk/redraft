import followConfirmed from "@/lib/public/followConfirmed";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return followConfirmed(request);
	},
} satisfies ServerEndPoint;
