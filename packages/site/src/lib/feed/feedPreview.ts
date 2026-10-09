//import profileView from "./profileView";
import { type Feed } from "../../data/schema/feedTable";
import { type Following } from "../../data/schema/followingTable";
import { type User } from "../../data/schema/usersTable";
import type FeedPreviewModel from "../../types/feed/FeedPreviewModel";
import { ARTICLE_LINK_TYPE, EVENT_LINK_TYPE, LINK_LINK_TYPE } from "../constants";
import ensureSlash from "../utils/ensureSlash";
import renderMarkdown from "../utils/renderMarkdown";
import isImageUrl from "../utils/isImageUrl";

export default function feedPreview(
	feed: Feed & { user?: Following | null },
	currentUser: User,
): FeedPreviewModel {
	return {
		slug: feed.slug,
		text: renderMarkdown(feed.text),
		author: feed.user
			? {
					name: feed.user.name,
					image: feed.user.image,
					url: feed.user.url,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
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
		isFile: feed.image ? !isImageUrl(feed.image) : false,
		isArticle: feed.link_type === ARTICLE_LINK_TYPE,
		isEvent: feed.link_type === EVENT_LINK_TYPE,
		eventStartsAt: feed.event_starts_at,
		eventLocation: feed.event_location,
		eventDuration: feed.event_duration,
		eventRsvpEnabled: feed.rsvp_enabled,
		eventRsvpLimit: feed.rsvp_limit,
		eventRsvpDeadline: feed.rsvp_deadline,
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
		ratingValue: feed.rating_value ?? undefined,
		ratingBound: feed.rating_bound ?? undefined,
	};
}
