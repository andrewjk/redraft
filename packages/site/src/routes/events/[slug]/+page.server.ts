import { type PageServerEndPoint } from "@torpor/build";
import * as api from "../../../lib/api";
import eventsGet from "../../api/events/[slug]/+server";
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
	},
} satisfies PageServerEndPoint;
