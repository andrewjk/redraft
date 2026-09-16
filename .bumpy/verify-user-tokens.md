---
"@redraft/site": patch
---

User tokens are now verified with the site's secret in both auth hooks, the session cookie holds a signed token instead of plaintext JSON, and token expiry is enforced.
