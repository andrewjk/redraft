// @ts-ignore
import placeholder from "../../assets/placeholder.png";

export default function placeholdify(src: string, size?: number) {
	if (src) {
		// Default to 80px square, which should look nice in our 40px circles
		return src + "?s=" + (size || 80);
	} else {
		return placeholder;
	}
}
