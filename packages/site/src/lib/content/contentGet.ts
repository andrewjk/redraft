import { serverError } from "@torpor/build/response";
import images from "../images";
import getErrorMessage from "../utils/getErrorMessage";

export default async function contentGet(name: string, query: Record<string, string>) {
	try {
		const img = images();

		// If we received `?s=`, then width and height are that value
		// Otherwise, use the optional `?w=` and `?h=` query params

		const width = parseInt(query.s || query.w || "0");
		const height = parseInt(query.s || query.h || "0");

		return await img.getImage(name, width, height);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
