import postSave from "@/lib/posts/postSave";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postSave(request);
	},
} satisfies ServerEndPoint;
