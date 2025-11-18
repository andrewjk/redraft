import type { ServerEndPoint } from "@torpor/build";
import profilePreview from "../../../lib/profile/profilePreview";

export default {
	get: async () => {
		return await profilePreview();
	},
} satisfies ServerEndPoint;
