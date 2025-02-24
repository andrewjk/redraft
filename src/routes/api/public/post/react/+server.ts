import postReaction from "@/lib/public/postReaction";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await postReaction(request);
	},
} satisfies ServerEndPoint;
