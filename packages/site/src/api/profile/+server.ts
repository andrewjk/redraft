import type { ServerEndPoint } from "@torpor/build";
import profileGet from "../../lib/profile/profileGet";

export default {
	get: async () => {
		return await profileGet();
	},
} satisfies ServerEndPoint;
