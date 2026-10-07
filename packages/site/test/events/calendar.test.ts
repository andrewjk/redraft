import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import { EVENT_LINK_TYPE } from "../../src/lib/constants";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "events-calendar");

	const event = (
		await db
			.insert(schema.eventsTable)
			.values({
				text: "Calendar event",
				location: "The park",
				// Midday on the 15th, in local time, so it falls in January
				// regardless of the test machine's timezone
				starts_at: new Date(2026, 0, 15, 12, 0, 0),
				duration: 60,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values({
		slug: "calendar-event",
		text: "An event",
		visibility: 0,
		link_type: EVENT_LINK_TYPE,
		link_title: "January meetup",
		event_id: event.id,
		published_at: new Date(),
		created_at: new Date(),
		updated_at: new Date(),
	});
});

afterAll(() => {
	cleanUpSiteTest("events-calendar");
});

test("event calendar page shows the month grid", async () => {
	const response = await runTest(site, "/events/calendar?month=2026-01");
	expect(response.status).toBe(200);

	const html = await response.text();
	expect(html).toContain("January 2026");
	expect(html).toContain("January meetup");
	expect(html).toContain("month=2025-12");
	expect(html).toContain("month=2026-02");
});

test("event calendar defaults to the current month", async () => {
	const response = await runTest(site, "/events/calendar");
	expect(response.status).toBe(200);
});
