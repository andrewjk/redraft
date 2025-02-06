import db from "@/data/db";
import { feedTable } from "@/data/schema";
import { ok, serverError } from "@torpor/build/response";
import getErrorMessage from "../utils/getErrorMessage";

export type InboxModel = {
	url: string;
};

export default async function followRequested(request: Request) {
	try {
		const model: InboxModel = await request.json();

		// TODO: Should we check the referrer or something to make sure it's
		// actually been sent from the url? And how do we do it in a way that
		// doesn't ddos either?

		// Get the current user
		//const currentUser = await getUser(username);
		//if (!currentUser) {
		//	return unauthorized();
		//}

		// Create the feed record
		const record = {
			approved: false,
			username: "",
			url: model.url,
			shared_key: "",
			name: "",
			image: "",
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(record).returning();

		// TODO: Create a notification

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
