import { grabPageInfo } from "grab-page-info";
import ky from "ky";

export default async function loadLinkInfo(url: string) {
	const response = await ky(url /*, { credentials: undefined }*/);
	const html = await response.text();
	const info = grabPageInfo(html);
	return {
		url: info.openUrl || url,
		title: info.twitterTitle || info.openTitle || info.title || url,
		description: info.twitterDescription || info.openDescription || info.metaDescription || "",
		publication: info.openSiteName || new URL(url).hostname,
		image: info.twitterImage?.url || info.openImages?.at(0)?.url || "",
	};
}
