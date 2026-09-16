---
"@redraft/site": patch
---

Public feed endpoints are hardened: shared key lookups ignore deleted relationships, and feed creates/updates/deletes are scoped to the sender's own entries.
