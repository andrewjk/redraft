# Follow-Ups

## Theme

The remaining hardcoded color is the error/notification background
`#fbe6e5` in `assets/style.css`. It isn't part of the theme variable set, so
it won't follow a custom theme. Add an `--error-back` (or similar) variable
to `THEME_VARIABLES` + `style.css` if error surfaces should be themeable too.

Federated profile copies (`following`/`followed_by` tables, `profileSend`)
don't carry the theme, so another instance viewing this profile won't see it.
Only the site's own pages are themed, which is the current intent.
