# Social

Blogging x Social Media x Newsletters

- Fully self-hostable
- All your data in a single file that you can take anywhere
- Make short status posts, or lengthy article posts
- Follow anyone and/or be followed by anyone with their own site
- Comment, like, react

## Things to do

Put an auth function on @torpor/build endpoints??

- Use one-time passwords for logging into other sites
- With a browser plugin to auto-login (only when commenting or otherwise interacting)

// TODO: lib should always return data OR responses

- [x] / page showing public profile, pinned (if any), 5ish posts
- [x] /feed page showing showing your feed (must be logged in)
  - [ ] pagination
- [x] /posts page showing public posts (with login button)
  - [ ] pagination
- [x] Status updates
- [x] Pin a status
- [ ] Articles attached to status
- [ ] Images attached to status
- [ ] Links attached to status
- [ ] Multi status "threads"
- [x] Following
- [x] Followed by
- [ ] Share with QR
- [x] Comments
  - [ ] Replying
  - [ ] Quoting
- [x] Approving
  - [ ] Auto-approving
- [ ] Blocking
- [ ] Notifications
- [ ] Realtime updates w/ sockets
- [x] Editing profile should propagate to following/followers
- [ ] Deploy

- [x] Liking
- [ ] Reacting
- [x] Saving
- [ ] Sharing / reposting
- [ ] Post visibility
- [ ] Recipient lists
- [ ] Editing posts
- [ ] Deleting your posts
- [ ] Deleting posts from other people from your db
- [ ] Paid tiers?
- [ ] Adding a nickname for following/followed by
- [ ] Location and links in profile
- [ ] Formatting w/ markdown
- [ ] Tags
- [ ] Settings
  - [ ] Number of posts to show on the homepage
  - [ ] Type of posts to show on the homepage
- etc

- [ ] Chat
- [ ] Audio
- [ ] Video
- [ ] Polls
- [ ] Events
- etc

- [ ] Open Graph
- [ ] RSS
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
