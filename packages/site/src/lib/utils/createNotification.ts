import { eq } from "drizzle-orm";
import type { Database, DatabaseTransaction } from "../../data/database";
import { notificationsTable, usersTable } from "../../data/schema";

/**
 * Inserts a notification and updates the unread count for the user.
 */
export default async function createNotification(
	db: Database | DatabaseTransaction,
	url: string,
	text: string,
) {
	await db.insert(notificationsTable).values({
		url,
		text,
		created_at: new Date(),
		updated_at: new Date(),
	});

	await db
		.update(usersTable)
		.set({ notification_count: db.$count(notificationsTable, eq(notificationsTable.read, false)) });
}
