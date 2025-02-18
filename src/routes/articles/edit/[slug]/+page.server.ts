import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, redirect, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get(`articles/edit/${params.slug}`, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ article: result });
	},
	actions: {
		saveArticle: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const article = formDataToObject(data);

			const result = await api.post(`articles/save`, article, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return redirect("articles/drafts");
		},
		publishArticle: async ({ appData, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const article = formDataToObject(data);

			const result = await api.post(`articles/publish`, article, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return redirect("articles");
		},
	},
} satisfies PageServerEndPoint;
