# Follow-Ups

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
