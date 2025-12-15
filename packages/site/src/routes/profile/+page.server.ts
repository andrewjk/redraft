import { type PageServerEndPoint } from "@torpor/build";
import profileGet from "../../api/profile/+server";
import * as api from "../../lib/api";
import logout from "../account/_actions/logout";

export default {
	load: async ({ params }) => {
		return await api.get("profile", profileGet, params);
	},
	actions: {
		logout,
	},
} satisfies PageServerEndPoint;
