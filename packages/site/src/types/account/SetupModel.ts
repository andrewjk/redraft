import * as v from "valibot";
import SetupSchema from "./SetupSchema";

type SetupModel = v.InferInput<typeof SetupSchema>;

export default SetupModel;
