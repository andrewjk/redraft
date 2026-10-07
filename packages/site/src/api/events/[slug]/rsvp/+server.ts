import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import rsvpCreate, { type RsvpRequester } from "../../../../lib/events/rsvpCreate";

export default {
	post: async ({ appData, request, params }) => {
		const follower = appData.follower;
		const user = appData.user;
		if (!follower && !user) {
			return unauthorized();
		}

		const requester: RsvpRequester = follower
			? {
					url: follower.url,
					name: follower.name,
					image: follower.image,
					sharedKey: follower.shared_key,
				}
			: {
					url: user!.url,
					name: user!.name,
					image: user!.image,
					sharedKey: "",
				};

		return await rsvpCreate(request, params, requester);
	},
} satisfies ServerEndPoint<"/api/events/[slug]/rsvp">;
