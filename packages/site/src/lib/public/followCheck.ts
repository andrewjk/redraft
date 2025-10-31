import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import { FOLLOW_CHECK_VERSION } from "../../types/public/FollowCheckModel";
import type FollowCheckModel from "../../types/public/FollowCheckModel";
import type FollowCheckResponseModel from "../../types/public/FollowCheckResponseModel";
import getErrorMessage from "../utils/getErrorMessage";

/**
 * Checks that a follow request was sent by this user.
 */
export default async function followCheck(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FollowCheckModel = await request.json();
		if (model.version !== FOLLOW_CHECK_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FOLLOW_CHECK_VERSION})`,
			);
		}

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst();

		// Check that a following record exists with this URL
		const followQuery = db.query.followingTable.findFirst({
			columns: { id: true },
			where: eq(followingTable.shared_key, model.sharedKey),
		});

		const [user, follow] = await Promise.all([userQuery, followQuery]);
		if (!user) {
			return notFound();
		}
		if (!follow) {
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
