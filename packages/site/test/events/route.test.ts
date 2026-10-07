import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import { EVENT_LINK_TYPE, RSVP_GOING } from "../../src/lib/constants";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "events-route");

	const event = (
		await db
			.insert(schema.eventsTable)
			.values({
				text: "Come along",
				location: "The park",
				starts_at: new Date(2026, 0, 15, 18, 0, 0),
				duration: 90,
				rsvp_enabled: true,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values({
		slug: "route-event",
		text: "An event",
		visibility: 0,
		link_type: EVENT_LINK_TYPE,
		link_title: "Park picnic",
		event_id: event.id,
		published_at: new Date(),
		created_at: new Date(),
		updated_at: new Date(),
	});

	await db.insert(schema.eventRsvpsTable).values({
		event_id: event.id,
		url: "http://localhost/bob/",
		name: "Bob Y",
		image: "bob.png",
		status: RSVP_GOING,
		created_at: new Date(),
		updated_at: new Date(),
	});
});

afterAll(() => {
	cleanUpSiteTest("events-route");
});

test("event page shows the count and calendar link", async () => {
	const response = await runTest(site, "/events/route-event");
	expect(response.status).toBe(200);

	const html = await response.text();
	expect(html).toContain("Park picnic");
	expect(html).toContain("Add to calendar");
	expect(html).toContain("1 going");
});
