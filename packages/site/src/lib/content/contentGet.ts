import { serverError } from "@torpor/build/response";
import storage from "../storage";
import getErrorMessage from "../utils/getErrorMessage";

export default async function contentGet(name: string) {
	try {
		const store = storage();
		return store.getFile(name);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
