import type { ServerEndPoint } from "@torpor/build";
import contentGet from "../../../../lib/content/contentGet";

export default {
	get: async ({ params, url }) => {
		// TODO: Access control!
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const query = Object.fromEntries(url.searchParams.entries());

		return await contentGet(params.slug, query);
	},
} satisfies ServerEndPoint;
