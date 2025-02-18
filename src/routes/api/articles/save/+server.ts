import articleSave from "@/lib/articles/articleSave";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await articleSave(request);
	},
} satisfies ServerEndPoint;
