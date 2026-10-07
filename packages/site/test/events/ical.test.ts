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
	db = await prepareSiteTest(site, "events-ical");

	const event = (
		await db
			.insert(schema.eventsTable)
			.values({
				text: "Come along",
				location: "The park",
				starts_at: new Date("2026-01-01T18:00:00Z"),
				duration: 90,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values({
		slug: "ical-event",
		text: "An event",
		visibility: 0,
		link_type: EVENT_LINK_TYPE,
		link_title: "Park picnic",
		event_id: event.id,
		published_at: new Date(),
		created_at: new Date(),
		updated_at: new Date(),
	});
});

afterAll(() => {
	cleanUpSiteTest("events-ical");
});

test("event ical endpoint returns a calendar", async () => {
	const response = await runTest(site, "/events/ical-event/ical");
	expect(response.status).toBe(200);
	expect(response.headers.get("Content-Type")).toContain("text/calendar");
	expect(response.headers.get("Content-Disposition")).toContain("ical-event.ics");

	const body = await response.text();
	expect(body).toContain("BEGIN:VCALENDAR");
	expect(body).toContain("SUMMARY:Park picnic");
	expect(body).toContain("LOCATION:The park");
	expect(body).toContain("DESCRIPTION:Come along");
	expect(body).toContain("DTSTART:20260101T180000Z");
	expect(body).toContain("DTEND:20260101T193000Z");
	expect(body).toContain("END:VCALENDAR");
});

test("event ical endpoint 404s for a missing event", async () => {
	const response = await runTest(site, "/events/nope/ical");
	expect(response.status).toBe(404);
});
