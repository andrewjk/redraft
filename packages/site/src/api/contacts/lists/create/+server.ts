import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
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
	post: async ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listSaveNew(request, user.code);
	},
} satisfies ServerEndPoint;
