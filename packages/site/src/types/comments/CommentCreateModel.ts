import * as v from "valibot";
import CommentCreateSchema from "./CommentCreateSchema";

type CommentCreateModel = v.InferInput<typeof CommentCreateSchema>;

export default CommentCreateModel;
