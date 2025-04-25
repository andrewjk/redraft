import postEdit from "@/lib/posts/postEdit";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postEdit(params.slug, user.code);
	},
} satisfies ServerEndPoint;
