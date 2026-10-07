import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { InferOutput } from "valibot";
import { eventsTable } from "./eventsTable";

/**
 * RSVPs to an event, sent from followers. These are stored on the event
 * creator's site only.
 */
export const eventRsvpsTable = sqliteTable("event_rsvps", {
	id: int().primaryKey({ autoIncrement: true }),
	event_id: int()
		.notNull()
		.references(() => eventsTable.id),
	// The follower's url, which identifies them
	url: text().notNull(),
	name: text().notNull(),
	image: text().notNull(),
	/**
	 * 1 = going
	 * 2 = maybe
	 * 3 = declined
	 */
	status: int().notNull(),
	created_at: int({ mode: "timestamp" }).notNull(),
	updated_at: int({ mode: "timestamp" }).notNull(),
	deleted_at: int({ mode: "timestamp" }),
});

export const EventRsvpSelectSchema = createSelectSchema(eventRsvpsTable);
export type EventRsvp = InferOutput<typeof EventRsvpSelectSchema>;
