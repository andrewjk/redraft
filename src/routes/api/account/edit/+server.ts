import accountEdit from "@/lib/account/accountEdit";
import accountGet from "@/lib/account/accountGet";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await accountGet(request, user.username);
	},
	post: ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return accountEdit(request, user.username);
	},
} satisfies ServerEndPoint;
