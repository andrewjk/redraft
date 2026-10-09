import { expect, test } from "vite-plus/test";
import type PostViewModel from "../../src/types/posts/PostViewModel";
import EventViewPage from "../../src/views/events/EventViewPage.torp";

function eventPost(overrides: Partial<PostViewModel> = {}): PostViewModel {
	return {
		slug: "my-event",
		text: "An event",
		image: null,
		imageAltText: null,
		isFile: false,
		isArticle: false,
		articleText: null,
		isEvent: true,
		eventText: "Event description",
		eventLocation: "The park",
		eventStartsAt: new Date("2026-01-01T18:00:00Z"),
		eventDuration: 60,
		eventRsvpEnabled: false,
		eventRsvpLimit: null,
		eventRsvpDeadline: null,
		eventRsvpGoingCount: 0,
		eventRsvpMaybeCount: 0,
		eventRsvpDeclinedCount: 0,
		eventRsvps: [],
		viewerRsvpStatus: null,
		linkUrl: null,
		linkTitle: "Park picnic",
		linkImage: null,
		linkPublication: null,
		linkEmbedSrc: null,
		linkEmbedWidth: null,
		linkEmbedHeight: null,
		ratingValue: null,
		ratingBound: null,
		author: { name: "Alice X", image: "alice.png", url: "http://localhost/alice/" },
		commentCount: 0,
		likeCount: 0,
		emojiFirst: null,
		emojiSecond: null,
		emojiThird: null,
		childCount: 0,
		children: [],
		publishedAt: new Date("2025-12-01T00:00:00Z"),
		republishedAt: null,
		tags: [],
		comments: [],
		...overrides,
	};
}

const base = "/";

test("event view shows an add to calendar link", async () => {
	const result = await EventViewPage({
		data: { post: eventPost(), user: null, follower: null, base },
	});

	expect(result.body).toContain("Add to calendar");
	expect(result.body).toContain('href="/events/my-event/ical"');
});

test("event view shows RSVP buttons to a follower", async () => {
	const result = await EventViewPage({
		data: {
			post: eventPost({ eventRsvpEnabled: true, eventRsvpGoingCount: 3, eventRsvpLimit: 30 }),
			user: null,
			follower: { url: "http://localhost/bob/", name: "Bob Y", image: "bob.png" },
			base,
		},
	});

	expect(result.body).toContain("Going");
	expect(result.body).toContain("Maybe");
	expect(result.body).toContain("Can't go");
	expect(result.body).toContain("3 going");
	expect(result.body).toContain("27 spots left");
	expect(result.body).toContain('action="?/rsvp"');
});

test("event view shows the RSVP list to the owner", async () => {
	const result = await EventViewPage({
		data: {
			post: eventPost({
				eventRsvpEnabled: true,
				eventRsvps: [{ url: "http://localhost/bob/", name: "Bob Y", image: "bob.png", status: 1 }],
			}),
			user: {
				url: "http://localhost/alice/",
				username: "alice",
				name: "Alice X",
				image: "alice.png",
			},
			follower: null,
			base,
		},
	});

	expect(result.body).toContain("Bob Y");
	expect(result.body).toContain("is going");
	// The owner doesn't get RSVP buttons
	expect(result.body).not.toContain('action="?/rsvp"');
});
