# Follow-Ups

## Post editor loses form data on save error

**Where:** `packages/site/src/views/posts/PostInput.torp`, `PostInputFields.torp`, and the
`routes/posts` page/action flow (`savePost` / `publishPost`).

**What:** Unlike the setup and profile edit pages (which initialize their `$state` from
`$props.form?.data` after a failed action), the post editor ignores `form.data` when it
re-renders after an error. The page load re-fetches server data only, so everything the
user typed (post text, tags, children, etc.) is lost, along with the selected image.

**Notes:**

- The post image already has a `<Hidden name="image">` round-trip in `PostInputFields.torp`,
  so once the form data merge is added, the image URL should survive like on the setup page.
- The article/event image (`ImageUpload` + `linkimagefile`) has no round-trip at all: there's
  no `Hidden` for `linkImage` in that branch, and `ImageUpload` is passed `post.linkimagefile`
  (undefined after an error re-render) instead of the uploaded `post.linkImage` URL.
- The image _file_ is uploaded to storage before the API call, so failed saves leave orphaned
  files in the content store.

## Form error re-renders 401 on authenticated pages

**Where:** `@torpor/build` `loadView` (serverHandlers), with site loads in
`routes/_layout.server.ts`, `routes/feed/+page.server.ts`, `routes/profile/edit/+page.server.ts`,
etc.

**What:** When a form action returns a 4xx response, the framework re-renders the view via
`loadView(..., fromForm = true)`, which skips the server hooks:

```js
const serverHooks = fromForm ? [] : await loadServerHooks(handler);
```

So the re-render's `load` runs with an empty `appData`. Every load that guards with
`if (!user) return unauthorized()` (feed, profile edit, posts, ...) then returns a bare
401 "Unauthorized" instead of the friendly re-render with the error message. Confirmed by
curl: a POST to `/profile/edit` with valid auth and an invalid email runs the action (the
API logs show it reaching schema validation) but the response is a 12-byte 401.

**Why it hasn't bitten everywhere:** the client-side form flow (X-Torpor-Form-Submit)
returns form errors as JSON without a server re-render, and pages whose load doesn't
require a user (e.g. `/account/setup`) re-render fine.

**Possible fixes:** pass the action's already-populated appData through to `loadView`, or
re-run enter hooks with `fromForm` (framework change); or make site loads tolerate an empty
appData when `$page.form` is set (site-level workaround).
