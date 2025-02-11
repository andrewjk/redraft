import { type User } from "@/data/schema/usersTable";

export type AccountPreview = {
	email: string;
	name: string;
	bio: string;
	image: string;
};

export default function accountPreview(user: User) {
	const view = {
		email: user.email,
		name: user.name,
		bio: user.bio,
		image: user.image,
	};
	return view;
}
