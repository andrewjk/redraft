import * as api from "@/lib/api";
import { FRONT_PAGE_SIZE } from "@/lib/constants";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import uuid from "@/lib/utils/uuid";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async () => {
		// Load the user's profile and 5ish latest posts
		const search = new URLSearchParams();
		search.set("limit", FRONT_PAGE_SIZE.toString());
		const [profile, { posts }] = await Promise.all([
			api.get("profile/preview"),
			api.get(`posts?${search}`),
		]);
		return ok({ profile, posts });
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
		pinPost: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post(`posts/pin`, model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}
		},
	},
} satisfies PageServerEndPoint;
