import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import extensionProfile from "../../../lib/extension/extensionProfile";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await extensionProfile(user.code);
	},
} satisfies ServerEndPoint;
