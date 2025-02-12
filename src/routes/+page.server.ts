import * as api from "@/lib/api";
import { FRONT_PAGE_SIZE } from "@/lib/constants";
import formDataToObject from "@/lib/utils/formDataToObject";
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
			const post = formDataToObject(data);

			const result = await api.post(`posts/create`, post, user.token);
			if (result.errors) {
				return unprocessable(result);
			}
		},
	},
} satisfies PageServerEndPoint;
