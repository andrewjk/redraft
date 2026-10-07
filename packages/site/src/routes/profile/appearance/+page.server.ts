import { type PageServerEndPoint } from "@torpor/build";
import { ok, seeOther, unauthorized } from "@torpor/build/response";
import accountAppearance from "../../../api/profile/appearance/+server";
import database from "../../../data/database";
import * as api from "../../../lib/api";
import { parseTheme } from "../../../lib/theme/theme";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// NOTE: the appearance page loads the theme itself rather than using
		// the layout's `viewing.theme`, because the client reuses cached
		// layout data on navigation -- which would show stale values after a
		// save (the page's own load is always re-run)
		const currentUser = await database().query.usersTable.findFirst({
			columns: { theme: true, dark_theme: true },
		});

		return ok({
			theme: parseTheme(currentUser?.theme) ?? {},
			darkTheme: parseTheme(currentUser?.dark_theme) ?? {},
		});
	},
	actions: {
		default: async ({ appData, request, params }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post(
				"profile/appearance",
				accountAppearance,
				params,
				model,
				user.token,
			);
			if (!result.ok) {
				return result;
			}

			return seeOther(params.user ? `/${params.user}/profile/appearance` : "/profile/appearance");
		},
	},
} satisfies PageServerEndPoint;
