import database from "@/data/database";
import { followingTable } from "@/data/schema";
import env from "@/lib/env";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type FollowCheckModel = {
	sharedKey: string;
};

export type FollowCheckResponseModel = {
	name: string;
	image: string;
	bio: string;
};

/**
 * Checks that a follow request was sent by this user.
 */
export default async function followCheck(request: Request) {
	try {
		const db = database();

		const model: FollowCheckModel = await request.json();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Check that a following record exists with this URL
		const record = await db.query.followingTable.findFirst({
			columns: { id: true },
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!record) {
			return notFound();
		}

		// Return the name and image
		// TODO: and the canonical url?
		const data: FollowCheckResponseModel = {
			name: user.name,
			// TODO: get the proper url
			image: `${env().SITE_LOCATION}${user.image}`,
			bio: user.bio,
		};

		return ok(data);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
