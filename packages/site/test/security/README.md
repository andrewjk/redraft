# Security tests

These tests describe the _secure_ behavior for the issues found in SECURITY.md.
They intentionally **fail** while the corresponding vulnerability exists, and
turn into passing regression tests as each fix lands:

| Test file                   | SECURITY.md finding                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `forged-user-token.test.ts` | CRITICAL: JWTs decoded, never verified (wrong-secret token, base64 cookie)                                        |
| `forged-follower.test.ts`   | CRITICAL: forged follower JWT unlocks follower-only posts                                                         |
| `expired-token.test.ts`     | MEDIUM: token expiry never enforced                                                                               |
| `shared-key-leak.test.ts`   | HIGH: shared keys exposed to the frontend                                                                         |
| `extension-token.test.ts`   | HIGH: extension tokens embed the shared key in decodable claims                                                   |
| `public-feed.test.ts`       | HIGH: unauthenticated public feed writes, no sender URL/slug scoping, no `deleted_at` check, no HTML sanitization |

When fixing a hole, also remove any related `FIXME` notes in the test names.
Run just these with `pnpm test test/security`.
