import { notFound, ok, serverError } from "@torpor/build/response";
import { desc, isNull, sql } from "drizzle-orm";
import database from "../../data/database";
import { postTagsTable, tagsTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

export type TagPreview = {
	text: string;
	count: number;
};

export type TagList = {
	tags: TagPreview[];
	tagsCount: number;
};

export default async function tagList(limit?: number, offset?: number): Promise<Response> {
	try {
		const db = database();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		const condition = isNull(tagsTable.deleted_at);

		// Get the tags from the database
		const dbtags = await db.query.tagsTable.findMany({
			limit,
			offset,
			where: condition,
			orderBy: desc(tagsTable.updated_at),
			// TODO: Put this back when the Drizzle alias bug is fixed
			extras: {
				//count: db.$count(postTagsTable, eq(postTagsTable.tag_id, tagsTable.id)).as("count"),
				count: db.$count(postTagsTable, sql`"post_tags"."tag_id" = "tagsTable"."id"`).as("count"),
			},
		});

		// Get the total tag count
		const tagsCount = await db.$count(tagsTable, condition);

		// Create tag previews
		const tags = dbtags.map((tag) => ({
			slug: tag.slug,
			text: tag.text,
			count: tag.count,
		}));

		return ok({
			tags,
			tagsCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
