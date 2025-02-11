import db from "@/data/db";
import { commentsTable } from "@/data/schema";
import { desc } from "drizzle-orm";
import commentPreview, { type CommentPreview } from "./commentPreview";

export default async function commentList(
	limit?: number,
	offset?: number,
): Promise<{ comments: CommentPreview[]; commentsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	// Get the comments from the database
	const dbcomments = await db.query.commentsTable.findMany({
		limit,
		offset,
		orderBy: desc(commentsTable.updated_at),
	});

	// Get the total comment count
	const commentsCount = await db.$count(commentsTable);

	// Create comment previews
	const comments = dbcomments.map((comment) => commentPreview(comment, user!));

	return {
		comments,
		commentsCount,
	};
}
