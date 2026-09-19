---
"@redraft/extension": patch
---

Follow meta tags are validated before use: they must be an http(s) URL on the viewed page's own origin, so malicious pages can't redirect follow actions.
