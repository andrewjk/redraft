import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, redirect, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const article = {
			id: -1,
			title: "",
			text: "",
			description: "",
		};

		return ok({ article });
	},
	actions: {
		saveArticle: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const post = formDataToObject(data);

			const result = await api.post(`articles/save`, post, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return redirect("/articles/drafts");
		},
		publishArticle: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const post = formDataToObject(data);

			const result = await api.post(`articles/publish`, post, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return redirect("/articles");
		},
	},
} satisfies PageServerEndPoint;
