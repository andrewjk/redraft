# AGENTS.md

## Monorepo structure

pnpm workspace with `packages/*` and `packages/adapters/*`.

- `packages/site` (`@redraft/site`) — main application: routes, API endpoints, views, DB schema, tests
- `packages/create-site` (`@redraft/create-site`) — `npm init` scaffold template
- `packages/adapters/adapter-core` (`@redraft/adapter-core`) — adapter interfaces
- `packages/adapters/adapter-node` (`@redraft/adapter-node`) — Node adapter
- `packages/adapters/adapter-cloudflare` (`@redraft/adapter-cloudflare`) — Cloudflare Workers adapter (has an extra IIFE build step via tsup)
- `packages/extension` (`@redraft/extension`) — Chrome/Firefox browser extension (WXT framework); private, versioned by bumpy but not published to npm

## Torpor framework reference

For the full `.torp` component and `@torpor/view` runtime API (`$watch`,
`$run`, `$onmount`, `$stream`, `$peek`, `$batch`, `$cache`, `$bind`,
`&ref`, `&value`, `&group`, slots, context, transitions, directives, etc.),
see [TORPOR_AGENTS.md](TORPOR_AGENTS.md).

## Toolchain

- **Type checking:** `tsgo` (not `tsc`) — uses `@typescript/native-preview` (Go-based TypeScript checker)
- **Bundling:** `tsdown` for library packages; `@torpor/build` (`tb`) for the site app
- **Database:** Drizzle ORM with SQLite (libsql). Schema in `packages/site/src/data/schema/`
- **Validation:** valibot (not zod)
- **Testing:** vitest with happy-dom (jose breaks in jsdom)
- **Views:** `.torp` files (custom `@torpor/view` component format, not Svelte/React)
- **Formatting:** Prettier with `@trivago/prettier-plugin-sort-imports` (sorts `../` before `./`). Tabs, 100 char width, trailing commas (none in JSON)

## Key commands (run from `packages/site`)

```
pnpm check          # type-check only (tsgo --noEmit)
pnpm build          # type-check + bundle library (tsdown)
pnpm build:site     # type-check + build the runnable site
pnpm dev            # dev server (tb --dev)
pnpm preview        # preview production build
pnpm test           # run vitest
pnpm db:push        # push schema changes to SQLite
pnpm db:generate    # generate migration files
```

For adapter packages, `pnpm build` = `tsgo --noEmit && tsdown` (from the adapter directory).

## Testing

- Tests live in `packages/site/test/` mirroring `src/` structure
- `globalSetup.ts` creates `test/data/testdata.db` by running migrations + seeding; `teardown` deletes it
- Each test copies `testdata.db` to a unique name via `prepareSiteTest()`, stubs env vars, and mocks `global.fetch`
- Required env stubs: `JWT_SECRET`, `JWT_SECRET_2`, `SITE_LOCATION`
- `globalThis.socialAdapter` must be set before tests (done by `prepareSiteTest`)

## Architecture notes

- Site routes: `src/routes/` (pages) and `src/api/` (API endpoints under `/api`), both registered in `site.config.ts` via `site.addRouteFolder()`
- API and page routes each have their own `_hook.server.ts` for auth/middleware
- Database is accessed through `globalThis.socialAdapter` (set by the adapter at runtime), not imported directly — this is how the adapter pattern works
- `@torpor/ui` must be in `ssr.noExternal` in vite config for `.torp` imports to work from node_modules
- The Cloudflare adapter has a special build: tsup IIFE → post-processing script → tsdown

## Publishing

Bumpy workflow (bump files in `.bumpy/`) from repo root:

```
pnpm bump:add       # add a bump file
pnpm bump:version   # build all + version
pnpm bump:publish   # build all + publish
```

## Follow-Ups

- When you decide **not** to fix a bug or issue inline (e.g. it's out of scope
  for the current task), record it for later by adding a section to
  `FOLLOWUP.md` describing the issue (what you saw, where, and any relevant
  context). Create the file if it does not yet exist.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
