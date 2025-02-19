import * as api from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import uuid from "@/lib/utils/uuid";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ url }) => {
		// TODO: Filter by permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's posts
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const { posts, postsCount } = await api.get(`posts?${search}`);

		const pageCount = Math.ceil(postsCount / PAGE_SIZE);

		return ok({ posts, pageCount });
	},
	actions: {
		createPost: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			// Save the image if it's been uploaded
			const imagefile = data.get("imagefile") as File;
			if (imagefile?.name) {
				let name = uuid() + "." + imagefile.name.split(".").at(-1);
				await uploadFile(imagefile, name);
				model.image = `${user.url}api/content/${name}`;
			}

			const result = await api.post(`posts/create`, model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}
		},
	},
} satisfies PageServerEndPoint;
