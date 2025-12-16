# Redraft Web Extension

This extension allows you to browse and interact with Redraft sites around the web.

## How it works

Press the Redraft icon to open the extension and login to your account.

When visiting a site that runs on Redraft, you will be shown a `Follow` button that will send a follow request.

When visiting a site belonging to someone you already follow, the extension will add an authentication header enabling you to interact with their site (e.g. you will be able to add comments).

## Privacy

This extension does not transmit any information outside of your browser, your Redraft site and the sites of users you are following.

It stores a list of the people you are following and the secret keys that you share.

# Build

This extension is built with the [https://wxt.dev](WXT) Web Extension Framework.

You can use the commands in `package.json` to install, build and package:

For Chrome:

- `pnpm i` to install dependencies
- `pnpm build` to compile the sources to an output folder
- `pnpm zip` to package the sources into a zip archive

Or for Firefox:

- `pnpm i` to install dependencies
- `pnpm build:firefox` to compile the sources to an output folder
- `pnpm zip:firefox` to package the sources into zip archives
