import { and, eq, gte, isNotNull, isNull, lt, or } from "drizzle-orm";
import database from "../../data/database";
import { eventsTable, postsTable } from "../../data/schema";
import { User } from "../../data/schema/usersTable";
import type EventCalendarModel from "../../types/events/EventCalendarModel";
import { EVENT_LINK_TYPE, FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "../constants";
import ensureSlash from "../utils/ensureSlash";

function dayKey(date: Date): string {
	const y = date.getFullYear();
	const m = `${date.getMonth() + 1}`.padStart(2, "0");
	const d = `${date.getDate()}`.padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/**
 * Builds a month grid of events, for the events calendar page.
 */
export default async function eventCalendar(
	user: User | undefined,
	follower: User | undefined,
	year: number,
	month: number,
): Promise<EventCalendarModel> {
	const db = database();

	const currentUser = await db.query.usersTable.findFirst();
	const siteUrl = ensureSlash(user?.url ?? currentUser?.url ?? "");

	const start = new Date(year, month - 1, 1);
	const end = new Date(year, month, 1);

	const rows = await db
		.select({
			slug: postsTable.slug,
			title: postsTable.link_title,
			startsAt: eventsTable.starts_at,
			location: eventsTable.location,
		})
		.from(eventsTable)
		.innerJoin(postsTable, eq(postsTable.event_id, eventsTable.id))
		.where(
			and(
				eq(postsTable.link_type, EVENT_LINK_TYPE),
				isNotNull(postsTable.published_at),
				isNull(postsTable.deleted_at),
				isNull(eventsTable.deleted_at),
				gte(eventsTable.starts_at, start),
				lt(eventsTable.starts_at, end),
				// Logged in users can see any post
				// Logged in followers can see public or follower posts
				// Non-logged in users can only see public posts
				user
					? undefined
					: follower
						? or(
								eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
								eq(postsTable.visibility, FOLLOWER_POST_VISIBILITY),
							)
						: eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
			),
		)
		.orderBy(eventsTable.starts_at);

	// Group the events by day
	const byDay = new Map<string, EventCalendarModel["weeks"][number][number]["events"]>();
	for (const row of rows) {
		const startsAt = new Date(row.startsAt);
		const key = dayKey(startsAt);
		const items = byDay.get(key) ?? [];
		items.push({
			slug: row.slug,
			title: row.title ?? "Event",
			startsAt,
			location: row.location,
			url: `${siteUrl}events/${row.slug}`,
		});
		byDay.set(key, items);
	}

	// Build a 6-week grid starting on Sunday
	const first = new Date(year, month - 1, 1);
	const gridStart = new Date(year, month - 1, 1 - first.getDay());
	const today = dayKey(new Date());

	const weeks: EventCalendarModel["weeks"] = [];
	for (let w = 0; w < 6; w++) {
		const days: EventCalendarModel["weeks"][number] = [];
		for (let d = 0; d < 7; d++) {
			const date = new Date(gridStart);
			date.setDate(gridStart.getDate() + w * 7 + d);
			const key = dayKey(date);
			days.push({
				day: date.getDate(),
				inMonth: date.getMonth() === month - 1,
				isToday: key === today,
				events: byDay.get(key) ?? [],
			});
		}
		weeks.push(days);
	}

	const prevDate = new Date(year, month - 2, 1);
	const nextDate = new Date(year, month, 1);
	const label = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
		first,
	);

	return {
		year,
		month,
		label,
		prev: `${prevDate.getFullYear()}-${`${prevDate.getMonth() + 1}`.padStart(2, "0")}`,
		next: `${nextDate.getFullYear()}-${`${nextDate.getMonth() + 1}`.padStart(2, "0")}`,
		weeks,
	};
}
