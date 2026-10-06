import { expect, test } from "vite-plus/test";
import Pagination from "../src/views/Pagination.torp";

// NOTE: happy-dom mangles links in parsed HTML, so these tests assert against
// the raw SSR markup

test("pagination shows every page including the last", async () => {
	const result = await Pagination({ pageCount: 3, page: 2 });

	const links = [...result.body.matchAll(/<a[^>]*href="\?page=(\d)"/g)].map((m) => m[1]);
	expect(links).toContain("1");
	expect(links).toContain("3");

	// The current page is not a link
	expect(links).not.toContain("2");
	expect(result.body).toMatch(/<span>2<\/span>/);
});

test("pagination is hidden for a single page", async () => {
	const result = await Pagination({ pageCount: 1, page: 1 });
	expect(result.body).not.toMatch(/page-link/);
});
