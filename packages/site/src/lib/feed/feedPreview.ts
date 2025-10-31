//import profileView from "./profileView";
import { micromark } from "micromark";
import { type Feed } from "../../data/schema/feedTable";
import { type Following } from "../../data/schema/followingTable";
import { type User } from "../../data/schema/usersTable";
import type FeedPreviewModel from "../../types/feed/FeedPreviewModel";
import { ARTICLE_LINK_TYPE, EVENT_LINK_TYPE, LINK_LINK_TYPE } from "../constants";
import ensureSlash from "../utils/ensureSlash";

export default function feedPreview(
	feed: Feed & { user?: Following | null },
	currentUser: User,
): FeedPreviewModel {
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
		isArticle: feed.link_type === ARTICLE_LINK_TYPE,
		isEvent: feed.link_type === EVENT_LINK_TYPE,
		linkUrl:
			feed.link_type === ARTICLE_LINK_TYPE
				? `${ensureSlash((feed.user ?? currentUser).url)}articles/${feed.slug}`
				: feed.link_type === EVENT_LINK_TYPE
					? `${ensureSlash((feed.user ?? currentUser).url)}events/${feed.slug}`
					: feed.link_url,
		linkTitle: feed.link_title,
		linkImage: feed.link_image,
		linkPublication: feed.link_type === LINK_LINK_TYPE ? feed.link_publication : currentUser.name,
		linkEmbedSrc: feed.link_embed_src,
		linkEmbedWidth: feed.link_embed_width,
		linkEmbedHeight: feed.link_embed_height,
		ratingValue: feed.rating_value,
		ratingBound: feed.rating_bound,
	};
}
