---
"@redraft/site": patch
---

Follower tokens are now signed with the relationship's shared key instead of a site-wide secret, and their claims no longer contain the key. Receiving sites verify tokens against the stored relationship.
