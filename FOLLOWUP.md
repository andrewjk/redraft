---

## 4. `unfollowSend` is not idempotent, but its test expects it to be

**Affects:** `packages/site/src/lib/unfollow/unfollowSend.ts`,
`packages/site/test/unfollow/send.test.ts`

**Symptom:** `test/unfollow/send.test.ts > unfollow send` fails — the second
`unfollowSend` call (same payload, "doing it twice should leave the existing
record as-is" per the test comment) returns 404 instead of 200.

**Root cause:** the record lookup filters `isNull(followingTable.deleted_at)`.
After the first unfollow sets `deleted_at`, the second call finds no record
and returns `notFound()`.

**Fix decision needed:** either make `unfollowSend` idempotent (if the record
exists but is already deleted, skip the peer notification and return `ok()`),
or update the test to expect the 404. The former matches the test's stated
intent and is safer for retries in `postResend`-style flows.
