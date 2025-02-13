import db from "@/data/db";
import { feedTable } from "@/data/schema";
import { ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type FeedSaveModel = {
	slug: string;
	saved: boolean;
};

export default async function feedSave(request: Request) {
	try {
		const model: FeedSaveModel = await request.json();

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
