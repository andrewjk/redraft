import { type User } from "@/data/schema/usersTable";

export type AccountView = {
	url: string;
	email: string;
	name: string;
	bio: string;
	image: string;
};

export default function accountView(user: User): AccountView {
	const view = {
		url: user.url,
		email: user.email,
		name: user.name,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
