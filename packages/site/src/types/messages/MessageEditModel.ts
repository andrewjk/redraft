import * as v from "valibot";
import MessageEditSchema from "./MessageEditSchema";

type MessageEditModel = v.InferInput<typeof MessageEditSchema>;

export default MessageEditModel;
