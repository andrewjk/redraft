import uuid from "./uuid";

/**
 * Builds a storage name for an uploaded attachment from its original
 * filename: a sanitised base, a short random suffix (so re-uploading a file
 * with the same name never overwrites an earlier one), and the extension.
 * The base is stripped to safe characters, so a crafted filename can't escape
 * the content folder (`../`, slashes, etc.).
 */
export default function uploadName(originalName: string, prefix = ""): string {
	const dot = originalName.lastIndexOf(".");
	const rawBase = dot > 0 ? originalName.slice(0, dot) : originalName;
	const rawExt = dot > 0 ? originalName.slice(dot + 1) : "";

	const base = rawBase.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) || "file";
	const ext = rawExt
		.replace(/[^a-zA-Z0-9]/g, "")
		.toLowerCase()
		.slice(0, 10);
	const id = uuid().replace(/-/g, "").slice(0, 8);

	return `${prefix}${base}-${id}${ext ? `.${ext}` : ""}`;
}
