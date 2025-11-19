# @redraft/site

## 0.2.2

### Patch Changes

- b08d643: Chore: also publish files in the src folder

## 0.2.1

### Patch Changes

- f272c67: Chore: only publish files in the dist folder
- Updated dependencies [f272c67]
  - @redraft/adapter-core@0.1.1
  - @redraft/adapter-node@0.1.1

## 0.2.0

### Minor Changes

- 4ec967c: !Fix: use a different JWT secret when communicating with contacts
- 210d67e: Chore: drop CJS build and go ESM only

### Patch Changes

- bfdf324: Edit: type all $props in components
- cdbc7df: Edit: add Page to the names of page components
- 98be0e9: Feat: separators in header menus
- d82b9b0: Fix: return the result of creating a comment
- 95e668a: Fix: post children
- 93c4b75: Chore: update dependencies
- 92306ff: Fix: child post ratings
- a07b30b: Edit: move api route files out into their own folder
- 98be0e9: Feat: separators in header menus
- 9616ff6: Fix: migrate link_type in feeds table
- 3bb643d: Chore: update dependencies
- 010826f: Fix: pagination
- b9063d1: Feat: client and server data validation
- dc7ed35: Feat: link profile name to profile (like image)
- 1d23287: Fix: form errors
- 08fbcf1: Chore: update dependencies
- 97f9959: Fix: upload child images
- Updated dependencies [4ec967c]
- Updated dependencies [93c4b75]
- Updated dependencies [210d67e]
- Updated dependencies [3bb643d]
- Updated dependencies [08fbcf1]
  - @redraft/adapter-core@0.1.0
  - @redraft/adapter-node@0.1.0

## 0.1.4

### Patch Changes

- a5743bb: Fix: some databases don't support transactions!
- Updated dependencies [a5743bb]
  - @redraft/adapter-core@0.0.7
  - @redraft/adapter-node@0.0.7

## 0.1.3

### Patch Changes

- 923949d: Fix: request image sizing in UI

## 0.1.2

### Patch Changes

- eda2edb: Feat: serve resized images

## 0.1.1

### Patch Changes

- b55277a: Feat: ratings
- c910080: Fix: lower case time properly
- b867a96: Feat: put posts to be sent in a queue
- de996c1: Refactor: return responses from api calls
- 315ebb9: Fix: return seeOther from views, not API
- 2f1ae76: Refactor: wrap all db operations in transactions
- ad6fe63: Fix: run fetches in parallel
- f826ebe: Fix: unify message and group endpoints and UI
- 5e92071: Feat: messages
- cceca56: Fix: nav bar icon style
- 1724128: Feat: events
- 8c21dd5: Feat: create recipient lists for sending posts to
- 554ab9e: Fix: rudimentary versioning for public methods
- 3bf245f: Feat: unread message and notification counts
- 163b160: Chore: update dependencies
- c9636b7: Fix: following
- c7ad84d: Fix: share sql conditions between queries and counts
- Updated dependencies [185a82a]
- Updated dependencies [163b160]
  - @redraft/adapter-core@0.0.6
  - @redraft/adapter-node@0.0.6

## 0.1.0

### Minor Changes

- 7ffe153: UI: moved things around quite a lot!
- bd519db: !Feat: allow having text, images and links together

### Patch Changes

- 84370ed: Feat: change the post icon to reflect its state
- 5cdaec3: Feat: user activity
- 2d98997: Feat: alt text for images
- 9875f02: Fix: don't need to await setUserToken
- bb77b90: Feat: show the viewed user name in the header
- 2239a72: Feat: add profile `about` field
- c8ac7bf: Feat: store the post input outside the view
- 2b8024d: Feat: links with oembed (for YouTube, Spotify, etc)
- c9c8515: Feat: make follows public
- cbca818: UI: hide image and link input fields after load
- 4f8f87e: Fix: prepend sluggified article title with the date
- 7466929: Feat: separate post and article views
- b6f7605: Chore: update dependencies
- 672a6b1: Feat: multi-part posts
- 1645cbe: Fix: show tags in post lists
- 35a19ea: UI: center post images
- 0a3876b: Chore: update dependencies
- 759d2b9: Chore: update dependencies
- a117353: Chore: update dependencies
- 401cc24: Fix: show tags when the user is logged out
- Updated dependencies [b6f7605]
- Updated dependencies [0a3876b]
- Updated dependencies [759d2b9]
- Updated dependencies [a117353]
  - @redraft/adapter-core@0.0.5
  - @redraft/adapter-node@0.0.5

## 0.0.15

### Patch Changes

- 66c86e4: Fix: properly parse api params

## 0.0.14

### Patch Changes

- e83002a: Chore: update dependencies
- 97c3d65: Fix: call API endpoints directly
- 71439e5: Fix: ensure that SITE_LOCATION ends with a slash
- Updated dependencies [e83002a]
  - @redraft/adapter-core@0.0.4
  - @redraft/adapter-node@0.0.4

## 0.0.13

### Patch Changes

- 742851b: Feat: strip protocol and slash from display urls
- f7953ab: Feat: show follow instructions to visitors
- 63e30a5: UI: max-width for the index profile
- d51ba8a: Feat: add a storage interface to adapters
- 82da6b1: Fix: link previews
- Updated dependencies [d51ba8a]
  - @redraft/adapter-core@0.0.3
  - @redraft/adapter-node@0.0.3

## 0.0.12

### Patch Changes

- 7b16280: Fix: use the user base url when redirecting
- 7054306: Fix: log out and view profile
- 259d205: Fix: delete old files when updating your profile
- 61427cc: Fix: edit profile layout

## 0.0.11

### Patch Changes

- 8769c64: Feat: show a follow button in the header
- fd78a02: Feat: notifications
- 7bd1b74: Chore: branding
- 9150382: Feat: unfollow
- 47f5f4f: Feat: blocking followers

## 0.0.10

### Patch Changes

- af6272a: Fix: comment urls and keys
- 7bd5e76: Fix: get the correct user image
- aec039a: Fix: base url should be `/` if no user
- 4f7c7fd: UI: move things around in the follow preview
- 4ac31c0: Fix: remove dead register link

## 0.0.9

### Patch Changes

- 0e1cd55: Fix: specify the base url

## 0.0.8

### Patch Changes

- 270bccc: Fix: make the adapters more flexible
- Updated dependencies [270bccc]
  - @redraft/adapter-core@0.0.2
  - @redraft/adapter-node@0.0.2

## 0.0.7

### Patch Changes

- 8e47c1f: Chore: get env from the adapter, if applicable

## 0.0.6

### Patch Changes

- c40eaa6: Chore: ship migrations

## 0.0.5

### Patch Changes

- 0a7d663: Chore: replace UUID with the crypto module

## 0.0.4

### Patch Changes

- b89e5d5: Fix: load the database at runtime
- 2909689: Fix: bad import

## 0.0.3

### Patch Changes

- 3fddb1e: Fix: make imports relative

## 0.0.2

### Patch Changes

- 49e1962: Chore: fix versions
