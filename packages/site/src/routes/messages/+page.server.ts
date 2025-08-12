import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../lib/api";
import messages from "../api/messages/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("messages", messages, params, user.token);
	},
} satisfies PageServerEndPoint;
