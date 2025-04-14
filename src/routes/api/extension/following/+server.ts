import extensionFollowing from "@/lib/extension/extensionFollowing";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({}) => {
		return await extensionFollowing();
	},
} satisfies ServerEndPoint;
