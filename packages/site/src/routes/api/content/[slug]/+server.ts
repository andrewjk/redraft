import contentGet from "@/lib/content/contentGet";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ params }) => {
		// TODO: Access control!
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await contentGet(params.slug);
	},
} satisfies ServerEndPoint;
