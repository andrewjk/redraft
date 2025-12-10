import type SetIconData from "@/types/SetIconData";
import { browser } from "wxt/browser";
// @ts-ignore
import icon16 from "../../assets/icons/icon-16.png";
// @ts-ignore
import icon32 from "../../assets/icons/icon-32.png";
// @ts-ignore
import icon48 from "../../assets/icons/icon-48.png";
// @ts-ignore
import icon128 from "../../assets/icons/icon-128.png";
// @ts-ignore
import iconBlue16 from "../../assets/icons/icon-blue-16.png";
// @ts-ignore
import iconBlue32 from "../../assets/icons/icon-blue-32.png";
// @ts-ignore
import iconBlue48 from "../../assets/icons/icon-blue-48.png";
// @ts-ignore
import iconBlue128 from "../../assets/icons/icon-blue-128.png";
// @ts-ignore
import iconGreen16 from "../../assets/icons/icon-green-16.png";
// @ts-ignore
import iconGreen32 from "../../assets/icons/icon-green-32.png";
// @ts-ignore
import iconGreen48 from "../../assets/icons/icon-green-48.png";
// @ts-ignore
import iconGreen128 from "../../assets/icons/icon-green-128.png";
// @ts-ignore
import iconRed16 from "../../assets/icons/icon-red-16.png";
// @ts-ignore
import iconRed32 from "../../assets/icons/icon-red-32.png";
// @ts-ignore
import iconRed48 from "../../assets/icons/icon-red-48.png";
// @ts-ignore
import iconRed128 from "../../assets/icons/icon-red-128.png";
// @ts-ignore
import iconYellow16 from "../../assets/icons/icon-yellow-16.png";
// @ts-ignore
import iconYellow32 from "../../assets/icons/icon-yellow-32.png";
// @ts-ignore
import iconYellow48 from "../../assets/icons/icon-yellow-48.png";
// @ts-ignore
import iconYellow128 from "../../assets/icons/icon-yellow-128.png";

// HACK: is there a better way to do this?
const icons: Record<string, string> = {
	"16": icon16,
	"32": icon32,
	"48": icon48,
	"128": icon128,
	"16-blue": iconBlue16,
	"32-blue": iconBlue32,
	"48-blue": iconBlue48,
	"128-blue": iconBlue128,
	"16-green": iconGreen16,
	"32-green": iconGreen32,
	"48-green": iconGreen48,
	"128-green": iconGreen128,
	"16-red": iconRed16,
	"32-red": iconRed32,
	"48-red": iconRed48,
	"128-red": iconRed128,
	"16-yellow": iconYellow16,
	"32-yellow": iconYellow32,
	"48-yellow": iconYellow48,
	"128-yellow": iconYellow128,
};

export function setIcon(data: SetIconData): void {
	let { prefix } = data;
	browser.action.setIcon({
		path: {
			16: icons[`16${prefix}`],
			32: icons[`32${prefix}`],
			48: icons[`48${prefix}`],
			128: icons[`128${prefix}`],
		},
	});
}
