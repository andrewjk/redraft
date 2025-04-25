import postGet from "@/lib/posts/postGet";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ appData, params }) => {
		return await postGet(appData.user, appData.follower, params.slug);
	},
} satisfies ServerEndPoint;
