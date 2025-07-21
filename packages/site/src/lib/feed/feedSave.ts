import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FeedSaveModel = {
	slug: string;
	saved: boolean;
};

export default async function feedSave(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: FeedSaveModel = await request.json();

				// Get the current user
				const currentUser = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, userIdQuery(code)),
				});
				if (!currentUser) {
					return unauthorized();
				}

				// Update the feed
				await tx
					.update(feedTable)
					.set({
						saved: model.saved,
					})
					.where(eq(feedTable.slug, model.slug));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}feed/${model.slug}`,
					text: `You ${model.saved ? "saved" : "unsaved"} a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
