export default function ensureSlash(url: string) {
	if (!url.endsWith("/")) {
		url += "/";
	}
	return url;
}
