/**
 * The CSS variables a user can customize. These are the `:root` variables
 * from `assets/style.css` (without the leading `--`), which the site's styles
 * are built on. Only these names are accepted, so a user can't inject
 * arbitrary CSS -- see `lib/theme/theme.ts`.
 */
export type ThemeVariable =
	// typography
	| "text-font"
	| "heading-font"
	| "text-size"
	| "heading-size"
	| "h2-size"
	| "h3-size"
	| "h4-size"
	// colours
	| "background"
	| "surface"
	| "surface-alt"
	| "hover"
	| "panel-back"
	| "code-back"
	| "header"
	| "text"
	| "text-secondary"
	| "text-disabled"
	| "muted"
	| "border-color"
	| "shadow-color"
	| "link"
	| "highlight"
	// misc
	| "border-radius";

/** A user's theme overrides, keyed by variable name */
export type ThemeModel = Partial<Record<ThemeVariable, string>>;
