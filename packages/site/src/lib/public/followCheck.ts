import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
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
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: FollowCheckModel = await request.json();

				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst();
				if (!user) {
					return notFound();
				}

				// Check that a following record exists with this URL
				const record = await tx.query.followingTable.findFirst({
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
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
