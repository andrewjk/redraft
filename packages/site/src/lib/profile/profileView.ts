import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import type { User, UserLink } from "../../data/schema/usersTable";
import type ProfileViewModel from "../../types/profile/ProfileViewModel";

export default function profileView(
	user: User & { links: UserLink[] },
	forEditing = false,
): ProfileViewModel {
	return {
		url: user.url,
		email: user.email,
		name: user.name,
		bio: user.bio,
		about: forEditing
			? user.about
			: micromark(user.about, {
					extensions: [gfm()],
					htmlExtensions: [gfmHtml()],
				}),
		location: user.location,
		image: user.image,
		links: user.links.map((l) => ({
			id: l.id,
			text: l.text,
			url: l.url,
		})),
	} satisfies ProfileViewModel;
}
