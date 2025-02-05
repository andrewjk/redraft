import { type User } from "@/data/schema";

export type AccountPreview = {
	email: string;
	token: string;
	username: string;
	bio: string;
	image: string;
};

export default function accountPreview(user: User, token: string) {
	const view = {
		email: user.email,
		token: token,
		username: user.username,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
