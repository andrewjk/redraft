import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { IMAGE_POST } from "@/data/schema/postsTable";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import postPreview, { PostPreview } from "../posts/postPreview";

export default async function mediaDraftList(
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	const condition = and(
		eq(postsTable.type, IMAGE_POST),
		drafts ? isNull(postsTable.published_at) : isNotNull(postsTable.published_at),
	);

	// Get the media from the database
	const dbmedia = await db.query.postsTable.findMany({
		limit,
		offset,
		where: condition,
		orderBy: desc(postsTable.updated_at),
	});

	// Get the total media count
	const postsCount = await db.$count(postsTable, condition);

	// Create media previews
	const posts = dbmedia.map((media) => postPreview(media, user!));

	return {
		posts,
		postsCount,
	};
}
