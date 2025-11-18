import type { ServerEndPoint } from "@torpor/build";
import commentGet from "../../../lib/comments/commentGet";

export default {
	get: async ({ params }) => {
		// TODO: Access control!
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await commentGet(params.slug);
	},
} satisfies ServerEndPoint;
