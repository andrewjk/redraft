export default function normalizeFileName(name: string): string {
	const contentPath = "/api/content/";
	if (name.includes(contentPath)) {
		name = name.substring(name.indexOf(contentPath) + contentPath.length);
	}
	if (name.startsWith("/")) {
		name = name.substring(1);
	}
	return name;
}
