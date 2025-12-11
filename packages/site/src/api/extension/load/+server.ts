import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import extensionLoad from "../../../lib/extension/extensionLoad";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await extensionLoad(user.code);
	},
} satisfies ServerEndPoint;
