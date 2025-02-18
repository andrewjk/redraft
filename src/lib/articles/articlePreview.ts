//import profileView from "./profileView";
import { type Article } from "@/data/schema/articlesTable";
import { type User } from "@/data/schema/usersTable";

type ArticleAuthor = {
	name: string;
	image: string;
	url: string;
};

export type ArticlePreview = {
	slug: string;
	title: string;
	description: string;
	author: ArticleAuthor;
	createdAt: Date;
	updatedAt: Date;
	publishedAt: Date | null;
};

export default function articlePreview(
	article: Article & { user?: ArticleAuthor | null },
	currentUser: User,
): ArticlePreview {
	return {
		slug: article.slug,
		title: article.title,
		description: article.description,
		author: article.user
			? {
					name: article.user.name,
					image: article.user.image,
					url: article.user.url,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
				},
		createdAt: article.created_at,
		updatedAt: article.updated_at,
		publishedAt: article.published_at,
	};
}
