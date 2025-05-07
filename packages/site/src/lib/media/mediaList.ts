import { User } from "../../data/schema/usersTable";
import { IMAGE_POST_TYPE } from "../constants";
import { getPosts } from "../posts/postList";
import { PostPreview } from "../posts/postPreview";

export type MediaList = {
	posts: PostPreview[];
	postsCount: number;
};

export async function mediaList(user?: User, follower?: User, limit?: number, offset?: number) {
	return await getPosts(false, IMAGE_POST_TYPE, user, follower, limit, offset);
}

export async function draftMediaList(
	code: string,
	user?: User,
	follower?: User,
	limit?: number,
	offset?: number,
) {
	return await getPosts(true, IMAGE_POST_TYPE, user, follower, limit, offset, code);
}
