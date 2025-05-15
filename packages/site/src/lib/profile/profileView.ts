import { type User, UserLink } from "../../data/schema/usersTable";

type LinkView = {
	id: number;
	text: string;
	url: string;
};

export type ProfileView = {
	url: string;
	email: string;
	name: string;
	bio: string;
	location: string;
	image: string;
	links: LinkView[];
};

export default function profileView(user: User & { links: UserLink[] }): ProfileView {
	const view = {
		url: user.url,
		email: user.email,
		name: user.name,
		bio: user.bio,
		location: user.location,
		image: user.image,
		links: user.links.map((l) => ({
			id: l.id,
			text: l.text,
			url: l.url,
		})),
	};
	return view;
}
