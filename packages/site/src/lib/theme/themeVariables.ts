import type { ThemeVariable } from "../../types/theme/ThemeModel";

export interface ThemeVariableInfo {
	/** The variable name, without the leading `--` */
	name: ThemeVariable;
	/** A human readable label for the appearance settings */
	label: string;
	/** How the value is validated and how the settings input is rendered */
	type: "color" | "length" | "font";
	/** The default value. Must match the same variable in assets/style.css */
	default: string;
	/**
	 * The dark mode default, for variables that can differ between light and
	 * dark. Must match the same variable in the `html.dark` rule in
	 * assets/style.css. Variables without one are shared across both modes
	 * (e.g. fonts, sizes, border radius)
	 */
	dark?: string;
}

/** Whether a variable can be customized separately for dark mode */
export function isDarkVariable(variable: ThemeVariableInfo): boolean {
	return variable.dark !== undefined;
}

/**
 * The whitelist of variables a user may override. Anything not in this list
 * is stripped from a submitted theme, so users can restyle the site without
 * being able to inject arbitrary CSS.
 */
export const THEME_VARIABLES: ThemeVariableInfo[] = [
	// Typography (shared between light and dark)
	{ name: "text-font", label: "Body font", type: "font", default: "ui-sans-serif, sans-serif" },
	{ name: "heading-font", label: "Heading font", type: "font", default: "ui-serif, serif" },
	{ name: "text-size", label: "Body text size", type: "length", default: "1.6rem" },
	{ name: "heading-size", label: "Heading 1 size", type: "length", default: "3.6rem" },
	{ name: "h2-size", label: "Heading 2 size", type: "length", default: "3rem" },
	{ name: "h3-size", label: "Heading 3 size", type: "length", default: "2.5rem" },
	{ name: "h4-size", label: "Heading 4 size", type: "length", default: "2.1rem" },
	// Colours (customizable per mode)
	{ name: "background", label: "Background", type: "color", default: "#fafbfc", dark: "#17191f" },
	{ name: "surface", label: "Surface", type: "color", default: "#ffffff", dark: "#20242c" },
	{
		name: "surface-alt",
		label: "Alternate surface",
		type: "color",
		default: "#fcfcfc",
		dark: "#262b34",
	},
	{ name: "hover", label: "Hover", type: "color", default: "#f0f2f6", dark: "#2b3038" },
	{
		name: "panel-back",
		label: "Panel background",
		type: "color",
		default: "#f3f6f9",
		dark: "#20242c",
	},
	{
		name: "code-back",
		label: "Code background",
		type: "color",
		default: "#e3e6e9",
		dark: "#262b34",
	},
	{ name: "header", label: "Headings", type: "color", default: "#222233", dark: "#e8eaf0" },
	{ name: "text", label: "Text", type: "color", default: "#222222", dark: "#d3d6de" },
	{
		name: "text-secondary",
		label: "Secondary text",
		type: "color",
		default: "#808080",
		dark: "#8b929b",
	},
	{
		name: "text-disabled",
		label: "Disabled text",
		type: "color",
		default: "#808080",
		dark: "#6a6f78",
	},
	{ name: "muted", label: "Muted", type: "color", default: "#d3d3d3", dark: "#3a4049" },
	{ name: "border-color", label: "Borders", type: "color", default: "#efefef", dark: "#3a4049" },
	{
		name: "shadow-color",
		label: "Shadows",
		type: "color",
		default: "rgba(0, 0, 0, 0.1)",
		dark: "rgba(0, 0, 0, 0.4)",
	},
	{ name: "link", label: "Links", type: "color", default: "#0066cc", dark: "#86a8ff" },
	{ name: "highlight", label: "Highlight", type: "color", default: "orange", dark: "orange" },
	// Misc (shared between light and dark)
	{ name: "border-radius", label: "Border radius", type: "length", default: "0.4rem" },
];

/** The colour variables, which can be customized per mode */
export const DARK_THEME_VARIABLES: ThemeVariableInfo[] = THEME_VARIABLES.filter(isDarkVariable);
