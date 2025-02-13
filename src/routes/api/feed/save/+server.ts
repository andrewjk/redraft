import feedSave from "@/lib/feed/feedSave";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return feedSave(request);
	},
} satisfies ServerEndPoint;
