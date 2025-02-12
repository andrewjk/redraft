import { type User } from "@/data/schema/usersTable";

export type ProfileView = {
	url: string;
	email: string;
	name: string;
	image: string;
	bio: string;
};

export default function profileView(user: User): ProfileView {
	const view = {
		url: user.url,
		email: user.email,
		name: user.name,
		image: user.image,
		bio: user.bio,
	};
	return view;
}
