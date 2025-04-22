import database from "@/data/database";
import { feedTable, usersTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FeedSaveModel = {
	slug: string;
	saved: boolean;
};

export default async function feedSave(request: Request, code: string) {
	try {
		const db = database();

		const model: FeedSaveModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Update the feed
		await db
			.update(feedTable)
			.set({
				saved: model.saved,
			})
			.where(eq(feedTable.slug, model.slug));

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
