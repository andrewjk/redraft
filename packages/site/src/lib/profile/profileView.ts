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
	image: string;
	bio: string;
	location: string;
	links: LinkView[];
};

export default function profileView(user: User & { links: UserLink[] }): ProfileView {
	const view = {
		url: user.url,
		email: user.email,
		name: user.name,
		image: user.image,
		bio: user.bio,
		location: user.location,
		links: user.links.map((l) => ({
			id: l.id,
			text: l.text,
			url: l.url,
		})),
	};
	return view;
}
