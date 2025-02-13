import postLiked from "@/lib/public/postLiked";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ request }) => {
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return postLiked(request);
	},
} satisfies ServerEndPoint;
