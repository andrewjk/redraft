import db from "@/data/db";
import { feedTable, followingTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type InboxModel = {
	sharedKey: string;
	slug: string;
	text: string;
};

export default async function postReceived(request: Request) {
	try {
		const model: InboxModel = await request.json();

		const user = await db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		// Create the feed record
		const record = {
			user_id: user.id,
			slug: model.slug,
			text: model.text,
			// TODO: Should receive posted_at, edited_at etc
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(record);

		// TODO: Create a notification

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
