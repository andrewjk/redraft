import { type User } from "../../data/schema/usersTable";
import type PostPreviewModel from "../../types/posts/PostPreviewModel";
import { ARTICLE_POST_TYPE } from "../constants";
import { getPosts } from "../posts/postList";

export interface ArticleList {
	posts: PostPreviewModel[];
	postsCount: number;
}

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
