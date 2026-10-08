# Follow-Ups

## Theme

The remaining hardcoded color is the error/notification background
`#fbe6e5` in `assets/style.css`. It isn't part of the theme variable set, so
it won't follow a custom theme. Add an `--error-back` (or similar) variable
to `THEME_VARIABLES` + `style.css` if error surfaces should be themeable too.

Federated profile copies (`following`/`followed_by` tables, `profileSend`)
don't carry the theme, so another instance viewing this profile won't see it.
Only the site's own pages are themed, which is the current intent.

## Testing

### Hydration tests lost with the `?server` query removal

The torpor unplugin dropped the `?server` compile override for tests (SSR
tests now live in `*-ssr.test.ts` and run in a DOM-shimmed SSR environment;
see `test/ssr-dom-env.ts`). That removed the only way to get both a
client-compiled and server-compiled version of a real component in one test,
so `test/posts/input.hydrate.client.test.ts` (which hydrated `PostInput` from
SSR HTML to guard the empty-`@if` hydration bug) was deleted. The underlying
bug is fixed and covered by torpor's own tests, but redraft no longer has a
direct hydration regression test -- worth restoring if torpor adds a test
helper for hydrating real `.torp` files.
