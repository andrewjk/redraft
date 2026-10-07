import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import themeEdit from "../../../lib/theme/themeEdit";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await themeEdit(request, user.code);
	},
} satisfies ServerEndPoint;
