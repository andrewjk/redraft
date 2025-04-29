import type { ServerEndPoint } from "@torpor/build";
import postGet from "../../../../lib/posts/postGet";

export default {
	get: async ({ appData, params }) => {
		return await postGet(appData.user, appData.follower, params.slug);
	},
} satisfies ServerEndPoint;
