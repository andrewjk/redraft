import { type User } from "@/data/schema";

export default function accountView(user: User, token: string) {
	const view = {
		email: user.email,
		token: token,
		username: user.username,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
