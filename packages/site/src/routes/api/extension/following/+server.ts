import extensionFollowing from "@/lib/extension/extensionFollowing";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await extensionFollowing(user.code);
	},
} satisfies ServerEndPoint;
