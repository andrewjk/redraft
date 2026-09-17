---
"@redraft/site": patch
---

Fix: markdown text (feed items, posts, comments, and profile about) is now rendered through a shared `renderMarkdown` util that sanitizes the generated HTML, so event handlers and scripts from remote content can't reach clients.
