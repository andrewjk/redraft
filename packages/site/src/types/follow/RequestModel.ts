import * as v from "valibot";
import RequestSchema from "./RequestSchema";

type RequestModel = v.InferInput<typeof RequestSchema>;

export default RequestModel;
