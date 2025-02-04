//import profileView from "./profileView";
import { type Post, type User } from "@/data/schema";

export type PostPreview = {
	text: string;
	createdAt: Date;
	updatedAt: Date;
};

export default function postPreview(post: Post, currentUser?: User): PostPreview {
	// TODO:
	//const authorView = profileView(post.author, currentUser);

	const postView = {
		text: post.text,
		createdAt: post.created_at,
		updatedAt: post.updated_at,
	};

	return postView;
}
