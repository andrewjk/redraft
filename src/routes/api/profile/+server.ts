import profileGet from "@/lib/profile/profileGet";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async () => {
		return await profileGet();
	},
} satisfies ServerEndPoint;
