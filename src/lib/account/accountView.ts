import { type User } from "@/data/schema/usersTable";

export type AccountView = {
	email: string;
	name: string;
	username: string;
	bio: string;
	image: string;
};

export default function accountView(user: User): AccountView {
	const view = {
		email: user.email,
		name: user.name,
		username: user.username,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
