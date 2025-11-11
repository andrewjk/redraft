import * as v from "valibot";
import ProfileEditSchema from "./ProfileEditSchema";

type ProfileEditModel = v.InferInput<typeof ProfileEditSchema>;

export default ProfileEditModel;
