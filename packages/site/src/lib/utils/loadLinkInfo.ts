import { grabPageInfo } from "grab-page-info";
import ky from "ky";

/*
const whitelist = [
	"https://youtube.com",
	"https://youtu.be",
	"https://www.youtube.com",
	"https://m.youtube.com",

	"https://vimeo.com",
	"https://www.vimeo.com",

	"https://open.spotify.com",
	"https://m.spotify.com",

	"https://tidal.com",
	"https://www.tidal.com",

	"https://music.apple.com",

	"https://twitter.com",
	"https://www.twitter.com",
	"https://m.twitter.com",

	"https://x.com",
	"https://www.x.com",
	"https://m.x.com",

	"https://bsky.app",
];
*/

export default async function loadLinkInfo(url: string) {
	try {
		const response = await ky(url /*, { credentials: undefined }*/);
		const html = await response.text();
		const info = grabPageInfo(html);

		let embedSrc: string | undefined = undefined;
		let embedWidth: number | undefined = undefined;
		let embedHeight: number | undefined = undefined;

		const embedUrl = info.links?.find(
			(l) => l.rel === "alternate" && l.type === "application/json+oembed",
		);
		if (embedUrl?.href) {
			const embedResponse = await ky(embedUrl.href /*, { credentials: undefined }*/);
			const embed = await embedResponse.json<Record<string, string>>();

			// Very rudimentary security. We could possibly whitelist instead?
			// But then we would miss out on things like Mastodon
			if (embed?.html) {
				let src = embed.html.match(/src=['"]{0,1}([^\s>]+)['"]{0,1}/)?.at(1) ?? "";
				// No http://, javascript://, etc
				if (src.startsWith("https://")) {
					embedSrc = src;
					embedWidth = parseInt(embed.html.match(/width=(['"]{0,1})(\d+)\1/)?.at(2) ?? "0");
					embedHeight = parseInt(embed.html.match(/height=(['"]{0,1})(\d+)\1/)?.at(2) ?? "0");
				}
			}
		}

		return {
			url: info.openUrl || url,
			title: info.twitterTitle || info.openTitle || info.title || url,
			description: info.twitterDescription || info.openDescription || info.metaDescription || "",
			publication: info.openSiteName || new URL(url).hostname,
			image: info.twitterImage?.url || info.openImages?.at(0)?.url || "",
			embedSrc,
			embedWidth,
			embedHeight,
		};
	} catch (err) {
		console.log("Error loading link info", url);
	}
}
