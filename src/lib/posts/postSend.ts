import db from "@/data/db";
import { followedByTable, postsTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import { FeedReceivedModel } from "../public/feedReceived";
import getErrorMessage from "../utils/getErrorMessage";

export type PostSendModel = {
	id: number;
};

export default async function postSend(request: Request) {
	try {
		const model: PostSendModel = await request.json();

		// Load the post
		const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, model.id) });
		if (!post) {
			return notFound();
		}

		// Load the followers
		const followers = await db.query.followedByTable.findMany({
			where: eq(followedByTable.approved, true),
		});

		// TODO: Insert a queue record for each follower and set it to sent when
		// success. Then delete all handled records at the end. Allow doing
		// something with failed records

		for (let follower of followers) {
			try {
				let sendUrl = `${follower.url}api/public/feed`;
				let sendData: FeedReceivedModel = {
					sharedKey: follower.shared_key,
					slug: post.slug,
					text: post.text,
				};
				await postPublic(sendUrl, sendData);
			} catch {
				// TODO: as above
			}
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
