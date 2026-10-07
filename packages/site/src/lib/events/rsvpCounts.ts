import { and, eq, isNull } from "drizzle-orm";
import type { Database, DatabaseTransaction } from "../../data/database";
import { eventRsvpsTable } from "../../data/schema";
import { RSVP_DECLINED, RSVP_GOING, RSVP_MAYBE } from "../constants";

export interface RsvpCounts {
	going: number;
	maybe: number;
	declined: number;
}

/**
 * Counts the RSVPs for an event, grouped by status.
 */
export default async function getRsvpCounts(
	db: Database | DatabaseTransaction,
	eventId: number | null | undefined,
): Promise<RsvpCounts> {
	if (!eventId) {
		return { going: 0, maybe: 0, declined: 0 };
	}

	const count = (status: number) =>
		db.$count(
			eventRsvpsTable,
			and(
				eq(eventRsvpsTable.event_id, eventId),
				eq(eventRsvpsTable.status, status),
				isNull(eventRsvpsTable.deleted_at),
			),
		);

	const [going, maybe, declined] = await Promise.all([
		count(RSVP_GOING),
		count(RSVP_MAYBE),
		count(RSVP_DECLINED),
	]);

	return { going, maybe, declined };
}
