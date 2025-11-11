export default function sizeImage(src: string | null | undefined, width?: number, height?: number) {
	if (src) {
		if (width || height) {
			let params = [];
			if (width) {
				params.push("w=" + width);
			}
			if (height) {
				params.push("h=" + height);
			}
			src += "?" + params.join("&");
		}
	}
	return src;
}
