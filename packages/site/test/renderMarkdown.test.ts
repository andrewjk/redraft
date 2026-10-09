import { expect, test } from "vite-plus/test";
import renderMarkdown from "../src/lib/utils/renderMarkdown";

test("renderMarkdown renders markdown to HTML", () => {
	expect(renderMarkdown("**bold** and *em*")).toBe(
		"<p><strong>bold</strong> and <em>em</em></p>\n",
	);
	expect(renderMarkdown("# Heading")).toBe("<h1>Heading</h1>\n");
});

test("renderMarkdown supports GFM", () => {
	expect(renderMarkdown("~~strike~~")).toBe("<p><del>strike</del></p>\n");
	expect(renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |")).toContain("<table>");
});

test("renderMarkdown sanitizes raw HTML", () => {
	// Scripts are removed together with their content
	expect(renderMarkdown("<script>alert(1)</script>hi")).toBe("hi\n");

	// Event handler attributes are dropped, but the element is kept
	const withImage = renderMarkdown(`Nice!\n\n<img src=x onerror="alert(1)">`);
	expect(withImage).not.toContain("onerror");
	expect(withImage).toContain('<img src="x">');

	// Unsafe URL schemes are stripped
	expect(renderMarkdown("[x](javascript:alert(1))")).toBe("<p><a>x</a></p>\n");

	// Safe links and inline HTML are kept
	expect(renderMarkdown("[ok](https://example.com)")).toBe(
		'<p><a href="https://example.com">ok</a></p>\n',
	);
});
