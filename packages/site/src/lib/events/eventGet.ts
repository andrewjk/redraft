//import { notFound, ok, serverError } from "@torpor/build/response";
//import { and, eq, isNull, or } from "drizzle-orm";
//import { micromark } from "micromark";
//import { gfm, gfmHtml } from "micromark-extension-gfm";
//import database from "../../data/database";
//import { eventsTable, commentsTable, eventsTable, postsTable } from "../../data/schema";
//import { User } from "../../data/schema/usersTable";
//import commentPreview from "../comments/commentPreview";
//import {
//	EVENT_LINK_TYPE,
//	EVENT_LINK_TYPE,
//	FOLLOWER_POST_VISIBILITY,
//	LINK_LINK_TYPE,
//	PUBLIC_POST_VISIBILITY,
//} from "../constants";
//import { PostViewModel } from "../posts/PostViewModel";
//import ensureSlash from "../utils/ensureSlash";
//import getErrorMessage from "../utils/getErrorMessage";
//
//export default async function eventGet(user: User, follower: User, slug: string) {
//	let errorMessage = ""
//
//	try {
//		const db = database();
//
//		// Get the current (only) user
//		const currentUserQuery = db.query.usersTable.findFirst();
//
//		const condition = and(
//			eq(postsTable.slug, slug),
//			// Logged in users can see any post
//			// Logged in followers can see public or follower posts
//			// Non-logged in users can only see public posts
//			user
//				? undefined
//				: follower
//					? or(
//							eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
//							eq(postsTable.visibility, FOLLOWER_POST_VISIBILITY),
//						)
//					: eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
//		);
//
//		// Get the post from the database
//		const postQuery = db.query.postsTable.findFirst({
//			where: condition,
//			with: {
//				postTags: {
//					with: {
//						tag: true,
//					},
//				},
//				// TODO: Async (all/child) load comments when scrolled to?
//				comments: {
//					//where: isNull(commentsTable.parent_id),
//					where: isNull(commentsTable.deleted_at),
//					with: {
//						user: true,
//					},
//				},
//			},
//		});
//
//		const [currentUser, post] = await Promise.all([currentUserQuery, postQuery]);
//		if (!currentUser) {
//			return notFound();
//		}
//		if (!post) {
//			return notFound();
//		}
//
//		// Create the view
//		let parentComments = post.comments.filter((c) => c.parent_id === null);
//		let childComments = post.comments.filter((c) => c.parent_id !== null);
//		const view: PostViewModel = {
//			slug: post.slug,
//			text: post.text,
//			image: post.image,
//			isEvent: post.link_type === EVENT_LINK_TYPE,
//			//eventText: eventText,
//			isEvent: post.link_type === EVENT_LINK_TYPE,
//			//eventText: eventText,
//			//eventLocation: eventLocation,
//			//eventStartsAt: eventStartsAt,
//			//eventDuration: eventDuration,
//			linkUrl:
//				post.link_type === EVENT_LINK_TYPE
//					? `${ensureSlash(currentUser.url)}events/${post.slug}`
//					: post.link_type === EVENT_LINK_TYPE
//						? `${ensureSlash(currentUser.url)}events/${post.slug}`
//						: post.link_url,
//			linkTitle: post.link_title,
//			linkImage: post.link_image,
//			linkPublication: post.link_type === LINK_LINK_TYPE ? post.link_publication : currentUser.name,
//			author: {
//				image: currentUser.image,
//				name: currentUser.name,
//				url: currentUser.url,
//			},
//			commentCount: post.comment_count,
//			likeCount: post.like_count,
//			emojiFirst: post.emoji_first,
//			emojiSecond: post.emoji_second,
//			emojiThird: post.emoji_third,
//			publishedAt: post.published_at ?? post.created_at,
//			republishedAt: post.republished_at,
//			tags: post.postTags.map((pt) => ({ slug: pt.tag.slug, text: pt.tag.text })),
//			comments: parentComments.map((c) => commentPreview(c, currentUser, childComments)),
//		};
//
//		// If it's an event, get the event text
//		if (post.event_id) {
//			const event = await db.query.eventsTable.findFirst({
//				where: eq(eventsTable.id, post.event_id),
//			});
//			if (event) {
//				view.eventText = micromark(event.text, {
//					extensions: [gfm()],
//					htmlExtensions: [gfmHtml()],
//				});
//			}
//		}
//
//		// If it's an event, get the event details
//		if (post.event_id) {
//			const event = await db.query.eventsTable.findFirst({
//				where: eq(eventsTable.id, post.event_id),
//			});
//			if (event) {
//				view.eventText = micromark(event.text, {
//					extensions: [gfm()],
//					htmlExtensions: [gfmHtml()],
//				});
//				view.eventLocation = event.location;
//				view.eventStartsAt = event.starts_at;
//				view.eventDuration = event.duration;
//			}
//		}
//
//		return ok({ post: view });
//	} catch (error) {
//		const message = errorMessage || getErrorMessage(error).message;
//		return serverError(message);
//	}
//}
