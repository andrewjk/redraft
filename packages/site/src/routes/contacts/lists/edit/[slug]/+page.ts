import { type PageEndPoint } from "@torpor/build";
import component from "../../../../../views/contacts/ListEditPage.torp";

export default {
	component,
} satisfies PageEndPoint<"/contacts/lists/edit/[slug]">;
