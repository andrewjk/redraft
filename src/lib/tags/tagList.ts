import database from "@/data/database";
import { tagsTable } from "@/data/schema";
import { desc, isNull } from "drizzle-orm";

export type TagPreview = {
	text: string;
	count: number;
};

export default async function tagList(
	limit?: number,
	offset?: number,
): Promise<{ tags: TagPreview[]; tagsCount: number }> {
	const db = database();

	// Get the current (only) user
	//const user = await db.query.usersTable.findFirst();

	const condition = isNull(tagsTable.deleted_at);

	// Get the tags from the database
	const dbtags = await db.query.tagsTable.findMany({
		limit,
		offset,
		where: condition,
		orderBy: desc(tagsTable.updated_at),
		// TODO: Put this back when the Drizzle alias bug is fixed
		//extras: {
		//	count: db.$count(postTagsTable, eq(postTagsTable.tag_id, tagsTable.id)).as("count"),
		//},
	});

	// Get the total tag count
	const tagsCount = await db.$count(tagsTable, condition);

	// Create tag previews
	const tags = dbtags.map((tag) => ({ slug: tag.slug, text: tag.text, count: /* tag.count */ 0 }));

	return {
		tags,
		tagsCount,
	};
}
