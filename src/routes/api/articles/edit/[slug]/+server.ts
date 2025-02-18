import articleEdit from "@/lib/articles/articleEdit";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await articleEdit(params.slug);
	},
} satisfies ServerEndPoint;
