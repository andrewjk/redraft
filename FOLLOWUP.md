# Follow-Ups

## Theme

The remaining hardcoded color is the error/notification background
`#fbe6e5` in `assets/style.css`. It isn't part of the theme variable set, so
it won't follow a custom theme. Add an `--error-back` (or similar) variable
to `THEME_VARIABLES` + `style.css` if error surfaces should be themeable too.

Federated profile copies (`following`/`followed_by` tables, `profileSend`)
don't carry the theme, so another instance viewing this profile won't see it.
Only the site's own pages are themed, which is the current intent.

## Upstream (torpor)

### Remove the client-only guard around the header theme SegmentedControl

`Layout.torp` renders the header theme toggle (`SegmentedControl`) only after
`$onmount`, behind a `$state.mounted` flag. That's a workaround: `@torpor/view`'s
`$cache` throws during SSR when `window` is defined, so server-rendering the
control fails in DOM-shimmed test environments (happy-dom here). Real Node SSR
is unaffected (no `window`), and it works client-side.

Once `$cache` detects server rendering properly (see the torpor repo's
FOLLOWUP.md, "`$cache` throws during SSR when `window` is defined"), drop the
`mounted` flag and render the SegmentedControl in the SSR output like torpor's
own site does, so it doesn't pop in after hydration.
