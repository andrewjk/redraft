import { User } from "../../data/schema/usersTable";
import { ARTICLE_POST_TYPE } from "../constants";
import { getPosts } from "../posts/postList";
import { PostPreview } from "../posts/postPreview";

export type ArticleList = {
	posts: PostPreview[];
	postsCount: number;
};

export async function articleList(user?: User, follower?: User, limit?: number, offset?: number) {
	return await getPosts(false, ARTICLE_POST_TYPE, user, follower, limit, offset);
}

export async function draftArticleList(
	code: string,
	user?: User,
	follower?: User,
	limit?: number,
	offset?: number,
) {
	return await getPosts(true, ARTICLE_POST_TYPE, user, follower, limit, offset, code);
}
