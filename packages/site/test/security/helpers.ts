import { expect } from "vite-plus/test";

// Torpor renders a page-load error response as the site's error page in place
// (keeping the requested url), so an error surfaces as its status code; older
// versions redirected to `/_error?status=...`, which some tests may still see
export function expectErrorResponse(response: Response, status: number) {
	const location = response.headers.get("location") ?? "";
	expect(
		response.status === status || location.startsWith(`/_error?status=${status}`),
		`expected ${status}, got ${response.status}${location ? ` -> ${location}` : ""}`,
	).toBe(true);
}
