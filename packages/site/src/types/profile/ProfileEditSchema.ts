import * as v from "valibot";
import type ProfileEditModel from "./ProfileEditModel";

v.setGlobalConfig({ abortPipeEarly: true });

const ProfileEditSchema: v.GenericSchema<unknown, ProfileEditModel> = v.object({
	email: v.pipe(v.string(), v.trim(), v.nonEmpty("Email is required"), v.email("Email is invalid")),
	name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name is required")),
	bio: v.pipe(v.string(), v.trim()),
	about: v.pipe(v.string(), v.trim()),
	location: v.pipe(v.string(), v.trim()),
	image: v.pipe(v.string(), v.trim()),
	links: v.array(
		// Either a valid URL + text object, or an empty text object
		v.union([
			v.object({
				id: v.number(),
				url: v.pipe(v.string(), v.trim(), v.nonEmpty("URL is required"), v.url("URL is invalid")),
				text: v.pipe(v.string(), v.trim(), v.nonEmpty("Text is required")),
			}),
			v.object({
				id: v.number(),
				url: v.custom<"">(() => true),
				text: v.custom<"">(() => true),
			}),
		]),
	),

	imagefile: v.nullish(v.union([v.string(), v.instance(ArrayBuffer), v.instance(File)])),
});

export default ProfileEditSchema;
