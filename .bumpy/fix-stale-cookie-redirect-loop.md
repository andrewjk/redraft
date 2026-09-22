---
"@redraft/site": patch
---

A stale auth cookie (e.g. after the database is recreated) no longer causes a redirect loop between the setup and feed pages; the cookie is cleared and the setup or login form is shown.
