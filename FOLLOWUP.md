# Follow-Ups

## `pnpm -r check` fails in adapter-core and adapter-node (tsgolint missing)

The `check` script in `packages/adapters/adapter-core` and `packages/adapters/adapter-node` is
`tsgo --noEmit && pnpm dlx oxlint --type-aware`, and the type-aware oxlint run fails with:

```
Failed to find tsgolint executable. You may need to add the `oxlint-tsgolint` package to your project?
```

This reproduces on a clean checkout (verified by stashing all local changes), so it is not related
to the extension move. Root `pnpm check` (`pnpm -r check`) therefore always fails at those two
packages. Fix by adding `oxlint-tsgolint` as a dev dependency (likely in the workspace root) or by
changing those scripts to plain `tsgo --noEmit` like the other packages.

## Root `pnpm test` fails with ENOENT `/src/routes`

Running `pnpm test` (`vp test run`) from the repo root fails every suite with:

```
Error: ENOENT: no such file or directory, scandir '/Users/andrewjk/Source/redraft/src/routes'
```

`prepareSiteTest` calls `site.addRouteFolder("./src/routes")`, which resolves against the repo
root instead of `packages/site` when vitest is invoked from the root. Tests pass when run from
`packages/site` (`pnpm --filter @redraft/site test`), so either fix the path resolution (e.g.
resolve relative to the test file) or the root script. Pre-existing (verified via stash).

## `public-feed.test.ts` sanitization test fails

`test/security/public-feed.test.ts > received feed content is sanitized` fails with:

```
AssertionError: expected '{"slug":"feed-xss","text":"<p>Nice po…' not to contain 'onerror'
```

Feed content still contains `onerror`, so something in the public feed output isn't sanitized
(possibly an attribute). 46 of 47 tests pass. Pre-existing (verified via stash).
