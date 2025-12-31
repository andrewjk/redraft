import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postPreviewGet from "../../../../lib/posts/postPreviewGet";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postPreviewGet(params.slug, user.code);
	},
} satisfies ServerEndPoint;
