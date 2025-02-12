import profileGet from "@/lib/profile/profileGet";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await profileGet();
	},
} satisfies ServerEndPoint;
