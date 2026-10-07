import type { ThemeModel } from "./theme/ThemeModel";

export default interface ViewingModel {
	url: string;
	name: string;
	image: string;
	bio: string;
	location: string;
	/** The site owner's theme overrides, if any */
	theme?: ThemeModel;
}
