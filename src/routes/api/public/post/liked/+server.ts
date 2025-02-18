import postLiked from "@/lib/public/postLiked";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: async ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await postLiked(request);
	},
} satisfies ServerEndPoint;
