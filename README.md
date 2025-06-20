# Redraft

An experiment.

https://redraft.social

Social media × blogging × newsletters

🚧 WARNING: WORK IN PROGRESS 🚧

- Fully self-hostable
- All your data in a single file that you can take anywhere
- Make short status posts, or lengthy article posts
- Follow anyone and/or be followed by anyone with their own site
- Comment, like, react (with a web extension)

## Setup

### Recommended

Use `npm` (or your preferred package manager) to create the template site:

```bash
npm init @redraft/site my-social
cd my-social
npm install
npm run dev
```

- Customise CSS in /src/assets/custom.css
- Set environment variables in a `.env` file for dev and in your production environment
  - Set `USERNAME` and `PASSWORD`, which will be used to setup your account
  - Set `SITE_LOCATION` to the URL which will be shared with others
  - Set `DB_CONNECTION`, pointing to an SQLite database
  - Set `JWT_SECRET` to a random passphrase for encrypting your user token
- Run `npm run dev` to create the database
- Deploy the site
- Go to SITE_LOCATION/account/setup to create your account
- Regularly run `npm update` and `npm run db:generate`

### Full customization

🚧 WARNING: THIS WILL NEED CONSTANT MAINTENANCE 🚧

- Fork the repo
- Tweak the code in /packages/site to your needs
- Customise CSS in /src/assets/custom.css
- Set environment variables in a `.env` file for dev and in your production environment
  - Set `USERNAME` and `PASSWORD`, which will be used to setup your account
  - Set `SITE_LOCATION` to the URL which will be shared with others
  - Set `DB_CONNECTION`, pointing to an SQLite database
  - Set `JWT_SECRET` to a random passphrase for encrypting your user token
- Run `npm run db:push` to create the database
- Deploy the site
- Go to `SITE_LOCATION/account/setup` to create your account

### Hosted

If the above sounds like too much work, you can pay for a hosted account at https://redraft.social for $4.99 per month. At any time, you can take your data and move to a self-hosted solution.

## How following works

- Your site sends the user you want to follow a request with your url and a secret key
  - If you have the web extension installed, sending a follow request is as simple as hitting the `Follow` button on the other user's site
  - Otherwise, you will need to go to your `/follow/request` page and enter the other user's url
- Their site confirms that you sent the request by hitting your `/url/check` endpoint
- Your `/url/check` endpoint sends your profile name and image
- If the other user approves your request, any posts they make will be sent to you
- Your site will check the secret key and save the post into your database if it matches
- To comment on their posts, you will need to install the web extension (see below)

## The web extension

You will have to use this unpacked for now. It's inside the `/extension` folder

// TODO: get this approved
