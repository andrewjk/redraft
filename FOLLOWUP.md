## 1. `tb --dev` ignores the `PORT` env var

**Affects:** `@torpor/build` `runDev`

> **FIXED** upstream: `runDev` now applies `process.env.PORT` to the vite
> server port. The workaround here was removed — `start_dev` passes `PORT`
> directly and `wait_dev` no longer parses the log.

**Detail:** dev servers always bind port `7059` (hardcoded, auto-incremented
by vite when busy) — `process.env.PORT` is only used for the "Connecting to"
log line. Production (`--preview`) does honor `PORT`. This forces anything
scripting dev servers to parse the "Listening on ..." log line to learn the
actual port.

**Suggested upstream fix:** apply `process.env.PORT` to the vite server port
in `runDev` (`config.server.port ??= parseInt(process.env.PORT)`).

**Workaround here:** `scripts/integration-test.sh` parses the bound port from
the dev server log.

---

## 2. `tb --build` / `--preview` fails on a fresh (empty) database

**Affects:** `@torpor/build` `runBuild` / `runPrerender`

> **FIXED** upstream: the prerenderer treats redirect responses as skips
> (logged, not failures). The workaround here was removed — setup now runs
> through the production server, and the integration test builds each site
> on its empty database as a regression check.

**Symptom:** brand-new installs can't build:

```
Error: Prerendering failed for 1 route:
  - /_error (status 303 redirect)
```

**Root cause:** `runPrerender` renders `/_error?status=404` through the root
layout whenever an `_error.ts` route exists. On an empty database the layout's
load redirects to `/account/setup`, and the 303 counts as a prerender failure
— so a site can never be built before its first user exists.

**Suggested upstream fix:** during prerender, treat a redirect response as a
skip (don't ship that page) rather than a failure — auth/setup redirects are
expected on an empty site.

**Workaround here:** the integration script runs each site's setup through a
dev server (which doesn't prerender) before building/previewing.

---

## 3. Dev server reload drops in-flight requests after first optimization

**Affects:** `@torpor/build` dev mode

> **FIXED** upstream: `runDev` loads the SSR entry before binding the
> listener, so the first dependency optimization (and its reload) completes
> before any request can arrive. The workarounds here were removed --
> `wait_for` no longer requires a status twice, and `http_post` no longer
> retries empty responses.

**Detail:** right after printing "Listening on ...", the dev server performs
its first dependency optimization and **restarts**, resetting any in-flight
connections (curl sees an empty reply). Requests stay broken until it settles.

**Workaround here:** `scripts/integration-test.sh` polls an API endpoint (not
`/`) for a valid status, requires it twice, and retries POSTs on empty
responses.

**Suggested upstream fix:** finish dependency optimization before binding the
listener, or queue requests across the reload.

---

## 4. Server crashes (`TypeError: immutable`) when a route returns a fetched Response

**Affects:** `@torpor/build` `ServerEvent.addHeaders`

> **FIXED** upstream: `addHeaders` now swaps in a mutable clone when the
> response's headers are immutable, instead of crashing. Fixed here too --
> `followRequest` and `followRequested` map peer error responses to local
> ones (`lib/utils/peerResponse`) instead of returning them directly, which
> also stops forwarding peer cookies/headers to users.

**Symptom:** an unhandled `TypeError: immutable` at
`ServerEvent.addHeaders` **kills the whole node process**. Reproduced by an
API endpoint that returns the `Response` it received from a cross-site `fetch`
(e.g. `followRequest` relaying the peer's error response).

**Root cause:** `addHeaders` appends `set-cookie`/CORS headers directly to
`this.response.headers`. Headers of a Response object obtained from `fetch()`
are immutable in undici, so the append throws outside of any try/catch.

**Suggested upstream fix:** in `addHeaders`, clone before mutating:
`this.response = new Response(this.response.body, this.response)`, or wrap the
appends in try/catch.

**Workaround here:** none yet in the app — endpoints should map peer
responses to locally-created responses instead of returning them directly
(e.g. `followRequest`'s `return response` on peer error).

---

## 5. `SetupSchema` requires fields that `SetupModel` types as optional

**Affects:** `packages/site/src/types/account/SetupSchema.ts` vs
`SetupModel.ts`

**Detail:** `SetupModel` types `image`/`bio`/`location` as optional, but
`SetupSchema` requires them (`v.pipe(v.string())`), so JSON API consumers that
follow the type get `400 Invalid key: Expected "image" but received undefined`.
(The login form always sends them, so the UI works.)

**Fix:** make the schema fields optional (`v.optional(v.pipe(v.string()))`) to
match the model.
