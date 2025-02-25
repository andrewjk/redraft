# Social

Social Media x Blogging x Newsletters

🚧 WARNING: WORK IN PROGRESS 🚧

- Fully self-hostable
- All your data in a single file that you can take anywhere
- Make short status posts, or lengthy article posts
- Follow anyone and/or be followed by anyone with their own site
- Comment, like, react

## Things to do

- Put an auth function on @torpor/build endpoints??
- Have a better error when you have an anchor in an anchor (and other things that are forbidden)?

- Use one-time passwords for logging into other sites
- With a browser plugin to auto-login (only when commenting or otherwise interacting)

- TODO: lib should always return data OR responses

- [x] / page showing public profile, pinned (if any), 5ish posts
- [x] /feed page showing showing your feed (must be logged in)
  - [ ] pagination
  - [ ] search
  - [ ] filtering by type
- [x] /posts page showing public posts (with login button)
  - [ ] pagination
  - [ ] search
  - [ ] filtering by type
- [x] Status updates
- [x] Pin a status
- [x] Articles attached to status
  - [ ] Word count
  - [ ] Banner image
- [x] Images attached to status
- [x] Links attached to status
- [ ] Posts attached to status? Not sure about this one...
- [ ] Stories/disappearing posts -- would need to withold from the feed
- [ ] Multi status "threads"
  - [ ] Post count
- [x] Republishing a post to move it back up to the top
- [x] Draft posts
- [x] Following
- [x] Followed by
- [ ] Share with QR
- [x] Comments
  - [x] Replying
  - [ ] Quoting
- [x] Approving
  - [ ] Auto-approving
- [ ] Blocking
- [ ] Notifications
- [ ] Realtime updates w/ sockets
- [x] Editing profile should propagate to following/followers
- [ ] Deploy

- [x] Liking
- [x] Reacting
  - [x] Heart, thumbs up, thumbs down, laugh, shock, sad
  - [ ] Any emoji (in a popup)
  - [ ] Post author should be able to see all interactions (comments, likes, emojis)
- [x] Saving
- [ ] Sharing / reposting
- [x] Post visibility
  - [ ] Recipient lists
- [x] Editing posts
  - [x] Re-publishing posts
- [ ] Deleting your posts
- [ ] Deleting posts from other people from your db
- [ ] Paid tiers?
- [ ] Adding a nickname for following/followed by users
- [x] Location and links in profile
- [x] Formatting w/ markdown
- [x] Tags
  - [ ] Auto-complete
  - [ ] Show how many posts are under a tag
  - [ ] Show when it was last used
- [ ] Spoiler tags / disclosures
- [ ] Settings
  - [ ] Number of posts to show on the homepage
  - [ ] Type of posts to show on the homepage
  - [ ] Nav menu options e.g. show Articles/Media/Images/Audio/Video
  - [ ] Disable comments or comment replies for legal reasons
  - [ ] Custom ToS, legal pages etc
  - [ ] Default post visibility
- etc

- [ ] Need a way to deal with out-of-date followers, where their api/db may not be compatible

- [ ] Chat
- [ ] Audio
- [ ] Video
- [ ] Polls
- [ ] Events
- [ ] Groups
- etc

- [ ] Open Graph
  - [x] Post
  - [ ] Everywhere else that has a <:head>
- [ ] RSS
- [ ] Cross post to Mastodon / Bluesky
- [ ] Host friends
- [ ] Multiple users e.g. for a publication/organisation
- [ ] Sign up to communicate with a single user on their page??
  - Maybe expand the followedBy table to have a password?
- [ ] Encryption

- [ ] Browser extension

- [ ] App

## Setup

- Fork the repo
- Deploy it
  - Set SITE_LOCATION env variable to the URL which will be shared with others
  - Set DB_CONNECTION env variable, pointing to an SQLite database
  - Set USERNAME env variable, which will be used to login the first time
- Customise CSS in src/assets/custom.css

## How following works

- From the /follow page
- Enter someone's url which sends them a request with our url and a secret key
- Their site confirms from our /url/check and gets our profile name and image
- If they approve, their site sends us a message and we can then login on their site with the secret key
- Any posts they make will be sent to us with the secret key and saved into our database
