import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const FOLLOW_CHECK_VERSION = 1;

export type FollowCheckModel = {
	sharedKey: string;
	version: number;
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
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: FollowCheckModel = await request.json();
		if (model.version !== FOLLOW_CHECK_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FOLLOW_CHECK_VERSION})`,
			);
		}

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
			image: user.image,
			bio: user.bio,
		};

		return ok(data);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
