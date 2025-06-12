import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postsTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import { type FeedReceivedModel } from "../public/feedReceived";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type PostSendModel = {
	id: number;
};

export default async function postSend(request: Request, code: string) {
	try {
		const db = database();

		const model: PostSendModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Load the post
		const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, model.id) });
		if (!post) {
			return notFound();
		}

		// Load the followers
		const followers = await db.query.followedByTable.findMany({
			where: and(eq(followedByTable.approved, true), isNull(followedByTable.deleted_at)),
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
					visibility: post.visibility,
					image: post.image,
					isArticle: post.is_article,
					linkUrl: post.link_url,
					linkTitle: post.link_title,
					linkImage: post.link_image,
					linkPublication: post.link_publication,
					linkEmbedSrc: post.link_embed_src,
					linkEmbedWidth: post.link_embed_width,
					linkEmbedHeight: post.link_embed_height,
					publishedAt: post.published_at!,
					republishedAt: post.republished_at,
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
