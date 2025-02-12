import profilePreview from "@/lib/profile/profilePreview";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async () => {
		return await profilePreview();
	},
} satisfies ServerEndPoint;
