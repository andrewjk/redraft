import * as v from "valibot";
import LoginSchema from "./LoginSchema";

type LoginModel = v.InferInput<typeof LoginSchema>;

export default LoginModel;
