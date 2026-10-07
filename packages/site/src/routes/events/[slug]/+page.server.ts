import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import eventsGet from "../../../api/events/[slug]/+server";
import eventsRsvp from "../../../api/events/[slug]/rsvp/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import createComment from "../../posts/_actions/createComment";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		return await api.get(
			`events/[slug=${params.slug}]`,
			eventsGet,
			params,
			user?.token || follower?.token,
		);
	},
	actions: {
		createComment,
		rsvp: async ({ appData, request, params }) => {
			// RSVPs can be made by a follower, or by the main user
			const user = appData.follower || appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post(
				`events/[slug=${params.slug}]/rsvp`,
				eventsRsvp,
				params,
				model,
				user.token,
			);
		},
	},
} satisfies PageServerEndPoint<"/events/[slug]">;
