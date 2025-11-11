import * as v from "valibot";
import ListEditSchema from "./ListEditSchema";

type ListEditModel = v.InferInput<typeof ListEditSchema>;

export default ListEditModel;
