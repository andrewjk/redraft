import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postEditGet from "../../../../lib/posts/postEditGet";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postEditGet(params.slug, user.code);
	},
} satisfies ServerEndPoint<"/api/posts/edit/[slug]">;
