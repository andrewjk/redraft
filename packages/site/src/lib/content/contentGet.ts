import { serverError } from "@torpor/build/response";
import images from "../images";
import getErrorMessage from "../utils/getErrorMessage";

export default async function contentGet(name: string, query: Record<string, string>) {
	try {
		const img = images();

		const width = parseInt(query.w ?? 0);
		const height = parseInt(query.h ?? 0) || width;

		return await img.getImage(name, width, height);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
