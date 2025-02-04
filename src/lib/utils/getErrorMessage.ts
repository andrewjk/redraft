// Adapted from https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript

export default function getErrorMessage(error: unknown) {
	console.log("ERROR", error);
	return toErrorWithMessage(error);
}

function toErrorWithMessage(maybeError: unknown): Error {
	if (isErrorWithMessage(maybeError)) {
		return maybeError;
	}

	try {
		return new Error(JSON.stringify(maybeError));
	} catch {
		// Fallback in case there's an error stringifying the maybeError
		// e.g. with circular references
		return new Error(String(maybeError));
	}
}

function isErrorWithMessage(error: unknown): error is Error {
	return (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as Record<string, unknown>).message === "string"
	);
}
