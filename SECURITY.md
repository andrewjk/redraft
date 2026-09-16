# Security Analysis

A review of the distributed social networking model and its implementation.
The original audit's findings all held up on re-verification; this version adds
a token-flow analysis (why `decodeJwt` was used, and why it can still be
fixed), newly discovered holes, and remediation plans for the two big items
(token verification and key rotation).

## Threat model

Each user runs their own site with a private SQLite database. Sites communicate
over HTTP, authenticating to each other with a shared secret (`shared_key`)
created when a follow relationship is established. There is no central
authority.

Clients (browsers with the extension) never store raw shared keys — they store
tokens derived by the user's own site (`extensionLoad`/`extensionRefresh`
regenerate them from the database). This matters for the rotation plan below.

### Token taxonomy

There are two JWT types with very different trust properties:

|                     | User token                                     | Follower token                                                                      |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Created by          | Your site (`createUserToken`, `JWT_SECRET`)    | **Your** site (`createHeaderToken`, `JWT_SECRET_2`)                                 |
| Consumed by         | Your site                                      | **The followed site**                                                               |
| Carried via         | `jwt` cookie, `Authorization`, `X-Social-User` | `X-Social-Follower` header                                                          |
| Verifiable locally? | **Yes** — same site signs and verifies         | **No** — signed by the visitor's site, so the receiver's secret can never verify it |

The follower token flow: `extensionLoad` mints one token per followed site
(claims: `{follower: {url, shared_key}}`), the extension attaches it to every
request to that site's domain, and the followed site decodes it to recognize
the visitor. **This cross-site property is why `decodeJwt` was used** — local
verification would reject every legitimate follower token. But see finding 2:
the wrapper is unverifiable and therefore security theater; the actual
authentication is the `shared_key` claim matching a `followedByTable` row.

## Findings

### HIGH: extension follower tokens embed the shared key in decodable claims

`createHeaderToken` puts the relationship's `shared_key` directly in the JWT
claims. Because the receiver never verifies the token, the claims are
effectively plaintext — and the header rides on _every_ request the extension
makes to the followed site (pages, images, API calls), not just authenticated
POSTs. Anyone who can observe the header (no TLS, TLS termination, logs) gets
the relationship key. (_Verified by test._)

**Fix:** when signing with the shared key (see plan), the key does not need to
be _in_ the claims at all — claims only need `{url, iat}`; the receiver looks
up the relationship by url and verifies the signature with its stored key. The
key then never travels.

### HIGH: No HTML sanitization

User content passes through `micromark` (markdown to HTML) without
sanitization. Combined with the shared key exposure above, this is a stored
XSS vector. The `jwt` cookie is `httpOnly` (torpor default), so XSS cannot
read the session directly — but same-origin `fetch('/api/feed')` rides the
session, exfiltrating every followed user's posts _and_ their leaked shared
keys. Post text, comment text, and profile fields (name, bio) are all
affected. (_Verified by test._)

**Fix:** Sanitize HTML output from micromark (e.g. with `sanitize-html`, which
is already a dependency). A CSP header is a worthwhile backstop.

### HIGH: Public endpoints have no authentication

All `/api/public/*` handlers have their authentication checks commented out.
The only verification on incoming posts and comments is the `shared_key` in
the request body, matched against the database. Beyond the missing auth:

- `feedReceived` does not verify the sender's URL against the relationship,
  and does not check `deleted_at` — a key from a _deleted_ relationship still
  works. (_Verified by test._)
- **New:** the create-or-update path looks up existing feed rows by `slug`
  _alone_ (`feedTable.findFirst({ where: eq(feedTable.slug, ...) })`), so one
  follower's key can **overwrite another follower's feed entry** by reusing
  its slug. (_Verified by test._)
- The lookup should scope by both the relationship _and_ the slug.

**Fix:** Uncomment auth checks, or at minimum scope the shared_key lookup to
non-deleted rows and the feed upsert by (relationship, slug).

### MEDIUM: No rate limiting

No rate limiting exists on any endpoint — login, public API, follow requests,
nothing. The `/api/public/follow/check` endpoint is effectively a shared_key
oracle that can be brute-forced (UUID keys make this infeasible today, but
rate limiting is cheap insurance, especially on login).

### MEDIUM: Token expiry not enforced

`userTokensTable.expires_at` is stored but never checked; `userIdQuery`
matches on `code` alone, so a single code leak is permanent.

**Fix:** Add an `expires_at > now` check to `userIdQuery`, and rotate codes at
login.

### MEDIUM: CORS set to wildcard

`Access-Control-Allow-Origin: *` is set on all API responses. Practically
mitigated: browsers won't attach credentials to `*`-origin requests, and the
API is header-authenticated — but the wildcard should still be narrowed for
defense in depth. (Not observable via the `runTest` harness; verified by
code inspection.)

### MEDIUM: Shared keys never rotate

A single static UUID per follow relationship, never rotated. Compromise is
permanent until the relationship is deleted. The key is created only by the
follower (`followRequest.ts`); the followed site never contributes. See the
rotation plan below.

### LOW: Setup password compared in plaintext

`accountSetup.ts` compares the provided password against the `PASSWORD`
environment variable directly (`model.password !== env().PASSWORD`). A hashed
compare (`compareWithHash`) was added for the already-existing-user path, but
the env comparison remains plaintext. Timing-safe comparison would be
trivial to add.

### Notes (reduce severity / context)

- `followerLogin` (key → follower session escalation) is fully commented out —
  a leaked key currently grants **write/act** access, not read access to the
  followed user's follower-only content.
- `postSend` copies `shared_key` into `postsQueueTable` rows at queue time —
  key material proliferates beyond the two relationship rows; rotation design
  must cover (or eliminate) these copies.

## Worst realistic case

Without any secret, a third party (Erik) cannot directly read posts sent from
Amy to Bryce — delivery is server-to-server into Bryce's database. The
realistic chains are:

1. **Session riding.** Any XSS Bryce's browser executes on Bryce's site (e.g.
   a malicious post from anyone Bryce follows) can `fetch('/api/feed')` as
   Bryce and exfiltrate all followed users' posts and (today) their shared
   keys.
2. **Key compromise ⇒ impersonation.** A leaked Amy↔Bryce key lets the holder
   inject/edit/delete Amy's posts in Bryce's feed (`feedReceived` is
   create-or-update), act as Bryce on Amy's site (likes, reactions, comments,
   DMs — all validate by key alone), sabotage the relationship
   (`unfollowRequested`), and confirm validity via `followCheck` — forever,
   since keys never rotate. It is an integrity/impersonation weapon more than
   a confidentiality break; the read path (`followerLogin`) is dormant.
3. **Code compromise.** Forged tokens are now rejected — user tokens are
   verified with the site's secret, and the cookie holds a signed token
   instead of plaintext JSON. A _stolen_ token still works until it expires
   (7 days, or 10 years with "remember me"), and codes are validated against
   `userTokensTable` with expiry enforced. Token theft remains the
   account-takeover path, which rotation and shorter max-ages would shrink
   further.

## Token verification plan

1. ~~**User tokens → `jwtVerify(JWT_SECRET)`.**~~ **Done** — user tokens are
   verified in both hooks, the cookie holds a signed token, and token expiry
   is enforced in `userIdQuery`.
2. **Follower tokens → sign with the relationship key.** `createHeaderToken`
   signs with `f.shared_key` (both sides hold it) and claims shrink to
   `{url, iat}` — the shared key never travels. On receipt: decode claims
   (unverified) → look up `followedByTable` by `url` → `jwtVerify(token,
that row's shared_key)`. Claim swapping becomes impossible: the signature
   only verifies against the claimed relationship's key. `JWT_SECRET_2` is
   retired (optionally with a transition window accepting old tokens).

## Key rotation plan

Rotation is a **two-server problem, not an N-device problem**: browsers and
extensions never hold the raw key — they hold derived tokens regenerated from
the site's database (`extensionLoad` fresh; `extensionRefresh` delta via
`updated_at > since`). Updating the server row propagates to all devices; an
offline-for-months device re-derives tokens on its first load back.

Protocol:

1. **Trigger** — either side (per-relationship UI button, or scheduled):
   `newKey = crypto.randomUUID()`; set row `previous_shared_key = old`,
   `shared_key = newKey`, `key_updated_at = now` (bump `updated_at` so
   extension delta-refresh propagates).
2. **Push** — `POST {peer}/api/public/key/rotated` with
   `{oldKey, newKey, version}`, version-checked like all public endpoints,
   authenticated by the **old** key (possession proves the relationship).
3. **Apply** — peer performs the same dual-key update, replies ok. If the peer
   is unreachable, retry through the existing `postsQueue`-style machinery
   (`failure_count`, `retry_at`).
4. **Grace window** — a shared lookup helper
   (`followedByByKey`/`followingByKey`) matches
   `shared_key = key OR previous_shared_key = key` and is used by every
   endpoint that currently matches `shared_key` alone; `previous_shared_key`
   is cleared after a window (e.g. 90 days) or lazily on next rotation. This
   covers in-flight posts (including the key copies in `postsQueueTable` —
   longer term, read the key at send time instead of queue time).
5. **Expired beyond the window (months offline)** — re-handshake: the expired
   peer sends a follow-style request; the site sees an existing
   `followedByTable` row for that url and re-verifies via the existing
   `followRequested` → `followCheck` callback flow, then re-issues a fresh key
   into the _same_ relationship (no duplicate rows, no data loss).
6. **Simultaneous rotation** — the push carries `oldKey`; if the peer already
   rotated away from it, adopt the incoming key (last-writer-wins converges).

Rotation doubles as follower-token revocation once tokens are shared-key
signed (plan above): a stolen token dies with the key it was signed with.

## Recommended priority

1. Sanitize micromark output (CSP as backstop)
2. Public endpoint hardening: scope feed upsert by (relationship, slug),
   check `deleted_at`, verify sender URL
3. Follower tokens → shared-key-signed, keyless claims
4. Key rotation (protocol above)
5. Rate limiting (login first), CORS narrowing, timing-safe setup compare
