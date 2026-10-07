import { expect, test } from "vite-plus/test";
import type UserModel from "../../src/types/UserModel";
import type PostEditModel from "../../src/types/posts/PostEditModel";
import PostInput from "../../src/views/posts/PostInput.torp";

const user: UserModel = {
	url: "http://localhost/alice/",
	username: "alice",
	name: "Alice X",
	image: "alice.png",
};

function event(id: number, overrides: Partial<PostEditModel> = {}): PostEditModel {
	return {
		id,
		slug: id < 0 ? "" : "my-event",
		children: [],
		isEvent: true,
		linkTitle: "Park picnic",
		eventText: "Description",
		eventLocation: "The park",
		eventStartsAt: new Date("2026-01-01T18:00:00Z"),
		eventDuration: 60,
		...overrides,
	};
}

test("event editor hides RSVP fields until enabled", async () => {
	const result = await PostInput({ post: event(-1), user, base: "/" });
	expect(result.body).toContain("Allow RSVPs");
	expect(result.body).toContain("Off");
	expect(result.body).not.toContain('name="eventRsvpLimit"');
});

test("event editor shows RSVP fields when enabled", async () => {
	const result = await PostInput({
		post: event(1, { published: true, eventRsvpEnabled: true, eventRsvpLimit: 30 }),
		user,
		base: "/",
	});
	expect(result.body).toContain("On");
	expect(result.body).toContain('name="eventRsvpLimit"');
	expect(result.body).toContain('name="eventRsvpDeadline"');
});
