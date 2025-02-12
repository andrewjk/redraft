import { type User } from "@/data/schema/usersTable";

export type ProfileView = {
	url: string;
	email: string;
	name: string;
	bio: string;
	image: string;
};

export default function profileView(user: User): ProfileView {
	const view = {
		url: user.url,
		email: user.email,
		name: user.name,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
