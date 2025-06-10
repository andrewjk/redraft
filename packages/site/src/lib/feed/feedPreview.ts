//import profileView from "./profileView";
import { micromark } from "micromark";
import { type Feed } from "../../data/schema/feedTable";
import { type Following } from "../../data/schema/followingTable";
import { type User } from "../../data/schema/usersTable";

type FeedAuthor = {
	name: string;
	image: string;
	url: string;
	sharedKey: string;
};

export type FeedPreview = {
	slug: string;
	text: string;
	author: FeedAuthor;
	liked: boolean;
	saved: boolean;
	emoji: string | null;
	publishedAt: Date;
	republishedAt: Date | null;
	commentCount: number;
	visibility: number;
	image: string | null;
	isArticle: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
};

export default function feedPreview(
	feed: Feed & { user?: Following | null },
	currentUser: User,
): FeedPreview {
	return {
		slug: feed.slug,
		text: micromark(feed.text),
		author: feed.user
			? {
					name: feed.user.name,
					image: feed.user.image,
					url: feed.user.url,
					sharedKey: feed.user.shared_key,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
					sharedKey: "",
				},
		liked: feed.liked,
		saved: feed.saved,
		emoji: feed.emoji,
		publishedAt: feed.published_at,
		republishedAt: feed.republished_at,
		commentCount: feed.comment_count,
		visibility: feed.visibility,
		image: feed.image,
		isArticle: feed.is_article,
		linkUrl: feed.link_url,
		linkTitle: feed.link_title,
		linkImage: feed.link_image,
		linkPublication: feed.link_publication,
	};
}
