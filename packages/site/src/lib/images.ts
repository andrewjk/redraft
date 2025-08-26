import { Images } from "@redraft/adapter-core";

export default function images(): Images {
	// @ts-ignore
	return globalThis.socialAdapter?.images as Images;
}
