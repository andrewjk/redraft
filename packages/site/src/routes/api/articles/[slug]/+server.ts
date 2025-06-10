import type { ServerEndPoint } from "@torpor/build";
import articleGet from "../../../../lib/articles/articleGet";

export default {
	get: async ({ appData, params }) => {
		return await articleGet(appData.user, appData.follower, params.slug);
	},
} satisfies ServerEndPoint;
