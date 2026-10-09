import { expect, test } from "vite-plus/test";
import contentGet from "../src/lib/content/contentGet";
import isAllowedFileType from "../src/lib/utils/isAllowedFileType";
import isImageUrl, { isImageFile } from "../src/lib/utils/isImageUrl";
import uploadName from "../src/lib/utils/uploadName";

// --- filename handling -----------------------------------------------------

test("uploadName sanitises the filename and adds a unique suffix", () => {
	const name = uploadName("../../etc/Quarterly Report.pdf", "file-");
	expect(name).not.toContain("/");
	expect(name).not.toContain("..");
	expect(name.startsWith("file-")).toBe(true);
	expect(name.endsWith(".pdf")).toBe(true);

	// Same original name -> different stored name, so it can't overwrite
	expect(uploadName("report.pdf")).not.toBe(uploadName("report.pdf"));
});

test("isImageUrl / isImageFile distinguish images from files", () => {
	expect(isImageUrl("http://x/api/content/abc.png")).toBe(true);
	expect(isImageUrl("http://x/api/content/file-report-1234.pdf")).toBe(false);
	expect(isImageUrl(undefined)).toBe(false);
	expect(isImageUrl("http://x/api/content/no-extension")).toBe(false);

	expect(isImageFile(new File(["x"], "a.png", { type: "image/png" }))).toBe(true);
	expect(isImageFile(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBe(false);
	// SVG can carry script, so it is treated as a file
	expect(isImageFile(new File(["x"], "a.svg", { type: "image/svg+xml" }))).toBe(false);
});

test("isAllowedFileType only allows pdf and zip", () => {
	expect(isAllowedFileType("report.pdf")).toBe(true);
	expect(isAllowedFileType("REPORT.PDF")).toBe(true);
	expect(isAllowedFileType("bundle.zip")).toBe(true);
	expect(isAllowedFileType("data.xlsx")).toBe(false);
	expect(isAllowedFileType("photo.png")).toBe(false);
	expect(isAllowedFileType("setup.exe")).toBe(false);
	expect(isAllowedFileType("payload.html")).toBe(false);
	expect(isAllowedFileType("no-extension")).toBe(false);
});

// --- serving headers -------------------------------------------------------

function stubImage() {
	// @ts-ignore
	globalThis.socialAdapter = {
		images: { getImage: async () => new Response("content") },
	};
}

test("content is served with safe headers", async () => {
	stubImage();

	const image = await contentGet("abc123.png", {});
	expect(image.headers.get("content-type")).toBe("image/png");
	expect(image.headers.get("x-content-type-options")).toBe("nosniff");
	expect(image.headers.get("content-disposition")).toBeNull();

	const file = await contentGet("file-report-1234.pdf", {});
	expect(file.headers.get("content-type")).toBe("application/octet-stream");
	expect(file.headers.get("content-disposition")).toBe(
		'attachment; filename="file-report-1234.pdf"',
	);
	expect(file.headers.get("x-content-type-options")).toBe("nosniff");

	// An uploaded .html must never be served as HTML (stored XSS)
	const html = await contentGet("evil-1234.html", {});
	expect(html.headers.get("content-type")).toBe("application/octet-stream");
	expect(html.headers.get("content-disposition")).toContain("attachment");
});

test("content serving refuses names that try to escape the folder", async () => {
	stubImage();
	const response = await contentGet("../../etc/passwd", {});
	expect(response.status).toBe(404);
});
