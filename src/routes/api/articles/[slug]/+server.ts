import articleGet from "@/lib/articles/articleGet";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ params }) => {
		// TODO: Access control!
		// TODO: Shouldn't be able to load a draft or deleted article unless logged in
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await articleGet(params.slug);
	},
} satisfies ServerEndPoint;
