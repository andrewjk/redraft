import * as v from "valibot";
import PostEditSchema from "./PostEditSchema";

type PostEditModel = v.InferInput<typeof PostEditSchema>;

export default PostEditModel;
