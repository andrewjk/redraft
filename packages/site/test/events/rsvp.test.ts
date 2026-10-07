import { Site } from "@torpor/build";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, assert, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import { EVENT_LINK_TYPE, RSVP_GOING, RSVP_MAYBE } from "../../src/lib/constants";
import rsvpCreate, { type RsvpRequester } from "../../src/lib/events/rsvpCreate";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

let db: LibSQLDatabase<typeof schema>;
const site: Site = new Site();

beforeAll(async () => {
	db = await prepareSiteTest(site, "events-rsvp");
	await insertEvent("open-event", { rsvp_enabled: true });
	await insertEvent("full-event", { rsvp_enabled: true, rsvp_limit: 1 });
	await insertEvent("closed-event", { rsvp_enabled: false });
});

afterAll(() => {
	cleanUpSiteTest("events-rsvp");
});

async function insertEvent(slug: string, event: { rsvp_enabled: boolean; rsvp_limit?: number }) {
	const row = (
		await db
			.insert(schema.eventsTable)
			.values({
				text: `${slug} description`,
				location: "Somewhere",
				starts_at: new Date("2026-01-01T18:00:00Z"),
				duration: 60,
				rsvp_enabled: event.rsvp_enabled,
				rsvp_limit: event.rsvp_limit,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values({
		slug,
		text: `${slug} post`,
		visibility: 0,
		link_type: EVENT_LINK_TYPE,
		link_title: `${slug} title`,
		event_id: row.id,
		published_at: new Date(),
		created_at: new Date(),
		updated_at: new Date(),
	});
}

function requester(url: string, name: string, sharedKey: string): RsvpRequester {
	return { url, name, image: `${name}.png`, sharedKey };
}

function rsvpRequest(status: number) {
	return new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify({ status }),
	});
}

test("follower RSVP is stored and notifies the owner", async () => {
	const response = await rsvpCreate(
		rsvpRequest(RSVP_GOING),
		{ slug: "open-event" },
		requester("http://localhost/bob/", "Bob Y", "yyy-bob"),
	);
	assert(response);
	expect(response.status).toBe(201);

	const rsvp = await db.query.eventRsvpsTable.findFirst({
		where: eq(schema.eventRsvpsTable.url, "http://localhost/bob/"),
	});
	assert(rsvp);
	expect(rsvp.status).toBe(RSVP_GOING);

	const notification = await db.query.notificationsTable.findFirst({
		where: eq(schema.notificationsTable.url, "http://localhost/alice/events/open-event"),
	});
	assert(notification);
	expect(notification.text).toBe("Bob Y is going to your event");
});

test("a follower can change their RSVP", async () => {
	const response = await rsvpCreate(
		rsvpRequest(RSVP_MAYBE),
		{ slug: "open-event" },
		requester("http://localhost/bob/", "Bob Y", "yyy-bob"),
	);
	assert(response);
	expect(response.status).toBe(201);

	const rows = await db.query.eventRsvpsTable.findMany({
		where: eq(schema.eventRsvpsTable.url, "http://localhost/bob/"),
	});
	expect(rows).toHaveLength(1);
	expect(rows[0].status).toBe(RSVP_MAYBE);
});

test("RSVPs are rejected when disabled", async () => {
	const response = await rsvpCreate(
		rsvpRequest(RSVP_GOING),
		{ slug: "closed-event" },
		requester("http://localhost/bob/", "Bob Y", "yyy-bob"),
	);
	assert(response);
	expect(response.status).toBe(400);
});

test("the RSVP limit is enforced", async () => {
	const first = await rsvpCreate(
		rsvpRequest(RSVP_GOING),
		{ slug: "full-event" },
		requester("http://localhost/bob/", "Bob Y", "yyy-bob"),
	);
	assert(first);
	expect(first.status).toBe(201);

	const second = await rsvpCreate(
		rsvpRequest(RSVP_GOING),
		{ slug: "full-event" },
		requester("http://localhost/eli/", "Eli Q", "yyy-eli"),
	);
	assert(second);
	expect(second.status).toBe(400);
});
