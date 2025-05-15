export default function stripProtocol(url: string) {
	return url.replace(/^https*:\/\//, "").replace(/\/$/, "");
}
