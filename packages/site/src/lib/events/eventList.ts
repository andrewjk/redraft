import { User } from "../../data/schema/usersTable";
import { EVENT_POST_TYPE } from "../constants";
import { getPosts } from "../posts/postList";
import { PostPreview } from "../posts/postPreview";

export type EventList = {
	posts: PostPreview[];
	postsCount: number;
};

export async function eventList(user?: User, follower?: User, limit?: number, offset?: number) {
	return await getPosts(false, EVENT_POST_TYPE, user, follower, limit, offset);
}

export async function draftEventList(
	code: string,
	user?: User,
	follower?: User,
	limit?: number,
	offset?: number,
) {
	return await getPosts(true, EVENT_POST_TYPE, user, follower, limit, offset, code);
}
