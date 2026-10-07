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
}

/**
 * The whitelist of variables a user may override. Anything not in this list
 * is stripped from a submitted theme, so users can restyle the site without
 * being able to inject arbitrary CSS.
 */
export const THEME_VARIABLES: ThemeVariableInfo[] = [
	// Typography
	{ name: "text-font", label: "Body font", type: "font", default: "ui-sans-serif, sans-serif" },
	{ name: "heading-font", label: "Heading font", type: "font", default: "ui-serif, serif" },
	{ name: "text-size", label: "Body text size", type: "length", default: "1.6rem" },
	{ name: "heading-size", label: "Heading 1 size", type: "length", default: "3.6rem" },
	{ name: "h2-size", label: "Heading 2 size", type: "length", default: "3rem" },
	{ name: "h3-size", label: "Heading 3 size", type: "length", default: "2.5rem" },
	{ name: "h4-size", label: "Heading 4 size", type: "length", default: "2.1rem" },
	// Colours
	{ name: "background", label: "Background", type: "color", default: "#fafbfc" },
	{ name: "surface", label: "Surface", type: "color", default: "#ffffff" },
	{ name: "surface-alt", label: "Alternate surface", type: "color", default: "#fcfcfc" },
	{ name: "hover", label: "Hover", type: "color", default: "#f0f2f6" },
	{ name: "panel-back", label: "Panel background", type: "color", default: "#f3f6f9" },
	{ name: "code-back", label: "Code background", type: "color", default: "#e3e6e9" },
	{ name: "header", label: "Headings", type: "color", default: "#222233" },
	{ name: "text", label: "Text", type: "color", default: "#222222" },
	{ name: "text-secondary", label: "Secondary text", type: "color", default: "#808080" },
	{ name: "text-disabled", label: "Disabled text", type: "color", default: "#808080" },
	{ name: "muted", label: "Muted", type: "color", default: "#d3d3d3" },
	{ name: "border-color", label: "Borders", type: "color", default: "#efefef" },
	{ name: "shadow-color", label: "Shadows", type: "color", default: "rgba(0, 0, 0, 0.1)" },
	{ name: "link", label: "Links", type: "color", default: "#0066cc" },
	{ name: "highlight", label: "Highlight", type: "color", default: "orange" },
	// Misc
	{ name: "border-radius", label: "Border radius", type: "length", default: "0.4rem" },
];
