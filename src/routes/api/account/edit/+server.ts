import accountEdit from "@/lib/account/accountEdit";
import accountGet from "@/lib/account/accountGet";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await accountGet(user.username);
	},
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return accountEdit(request, user.username);
	},
} satisfies ServerEndPoint;
