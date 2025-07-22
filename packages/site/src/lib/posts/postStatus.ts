import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { postsQueueTable, postsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postPreview, { PostPreview } from "./postPreview";

export type PostStatusModel = {
	id: number;
	post: PostPreview;
	failed: {
		url: string;
		name: string;
		image: string;
	}[];
};

export default async function postStatus(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Load the post
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
			},
		});
		if (!post) {
			return notFound();
		}

		// Load the queue
		const queue = await db.query.postsQueueTable.findMany({
			where: eq(postsQueueTable.post_id, post.id),
			with: {
				user: true,
			},
		});

		const result: PostStatusModel = {
			id: post.id,
			post: postPreview(post, currentUser),
			failed: queue.map((f) => {
				return {
					url: f.user.url,
					name: f.user.name,
					image: f.user.image,
				};
			}),
		};

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
