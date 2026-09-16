import { expect } from "vite-plus/test";

// Torpor converts endpoint error responses into a redirect to the error page
// (e.g. `/_error?status=401&...`), so an error may surface either as the raw
// status or as the location header
export function expectErrorResponse(response: Response, status: number) {
	const location = response.headers.get("location") ?? "";
	expect(
		response.status === status || location.startsWith(`/_error?status=${status}`),
		`expected ${status}, got ${response.status}${location ? ` -> ${location}` : ""}`,
	).toBe(true);
}
