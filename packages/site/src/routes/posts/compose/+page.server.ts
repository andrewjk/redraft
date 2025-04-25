import publishPost from "@/routes/posts/_actions/publishPost";
import savePost from "@/routes/posts/_actions/savePost";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const model = {
			id: -1,
			type: 0,
			text: "",
		};

		return ok({ post: model });
	},
	actions: {
		savePost,
		publishPost,
	},
} satisfies PageServerEndPoint;
