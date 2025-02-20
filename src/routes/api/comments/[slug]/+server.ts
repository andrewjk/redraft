import commentGet from "@/lib/comments/commentGet";
import type { ServerEndPoint } from "@torpor/build";

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
