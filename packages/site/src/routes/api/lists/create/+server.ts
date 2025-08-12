import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import listGetNew from "../../../../lib/contacts/listGetNew";
import listSaveNew from "../../../../lib/contacts/listSaveNew";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listGetNew(user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await listSaveNew(request, user.code);
		if (!result.ok) {
			return result;
		}

		return seeOther(params.user ? `/${params.user}/contacts/lists` : "/contacts/lists");
	},
} satisfies ServerEndPoint;
