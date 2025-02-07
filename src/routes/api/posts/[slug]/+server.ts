import postGet from "@/lib/posts/postGet";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ params }) => {
		// TODO: Access control!
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await postGet(params.slug);
	},
} satisfies ServerEndPoint;
