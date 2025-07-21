import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import getErrorMessage from "../utils/getErrorMessage";

export type ActivityReceivedModel = {
	sharedKey: string;
	url: string;
	type: "commented" | "liked" | "unliked" | "reacted";
};

export default async function activityReceived(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: ActivityReceivedModel = await request.json();

				const user = await tx.query.followingTable.findFirst({
					where: eq(followingTable.shared_key, model.sharedKey),
				});
				if (!user) {
					return notFound();
				}

				let message = "Unknown activity";
				switch (model.type) {
					case "commented": {
						message = "You commented on a post";
						break;
					}
					case "liked": {
						message = "You liked a post";
						break;
					}
					case "unliked": {
						message = "You unliked a post";
						break;
					}
					case "reacted": {
						message = "You reacted to a post";
						break;
					}
				}

				// Create an activity record
				await tx.insert(activityTable).values({
					// Concat the urls for a bit of extra security (so someone can't
					// send us a full URL pointing to anywhere, only the pathname)
					url: `${user.url}${model.url}`,
					text: message,
					created_at: new Date(),
					updated_at: new Date(),
				});

				return ok();
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
