# Changelog

## 0.1.0

<sub>2026-10-09</sub>

- _(minor)_
  Moved the extension into the workspace as `@redraft/extension` so it's versioned by bumpy, upgraded it to Torpor v1, and fixed storage typing throughout (`browser.storage.local.get<Storage>()`).
- _(patch)_
  Follower tokens and the following list are now kept in memory-only browser session storage; only a token-free copy is persisted to disk.
- _(patch)_
  Header injection rules and page matching are now anchored to exact site URLs, so authentication tokens are no longer sent to lookalike domains.
- _(patch)_
  Follow meta tags are validated before use: they must be an http(s) URL on the viewed page's own origin, so malicious pages can't redirect follow actions.
- _(patch)_ Removed request URL logging from the background worker.
- _(patch)_
  Extension login now survives browser restarts; follower tokens are re-derived from the user's site on startup instead of being stored.
- _(patch)_
  Logout now deletes the token on the user's site and removes the header injection rules, so no tokens are sent while logged out.
- _(patch)_ Fix: better icon line widths
- _(patch)_ Chore: update dependencies
- _(patch)_ Chore: update dependencies
