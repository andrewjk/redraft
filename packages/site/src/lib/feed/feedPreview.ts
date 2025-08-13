//import profileView from "./profileView";
import { micromark } from "micromark";
import { type Feed } from "../../data/schema/feedTable";
import { type Following } from "../../data/schema/followingTable";
import { type User } from "../../data/schema/usersTable";
import ensureSlash from "../utils/ensureSlash";

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
	childCount: number;
	commentCount: number;
	visibility: number;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	ratingValue: number | null;
	ratingBound: number | null;
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
		childCount: feed.child_count,
		commentCount: feed.comment_count,
		visibility: feed.visibility,
		image: feed.image,
		imageAltText: feed.image_alt_text,
		isArticle: feed.is_article,
		linkUrl: feed.is_article
			? `${ensureSlash((feed.user ?? currentUser).url)}articles/${feed.slug}`
			: feed.link_url,
		linkTitle: feed.link_title,
		linkImage: feed.link_image,
		linkPublication: feed.is_article ? currentUser.name : feed.link_publication,
		linkEmbedSrc: feed.link_embed_src,
		linkEmbedWidth: feed.link_embed_width,
		linkEmbedHeight: feed.link_embed_height,
		ratingValue: feed.rating_value,
		ratingBound: feed.rating_bound,
	};
}
