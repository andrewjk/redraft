import { builtinEnvironments } from "vite-plus/test/runtime";

/**
 * A DOM-shimmed SSR environment for `*-ssr.test.ts`: happy-dom provides the
 * browser globals some server-rendered code touches, while
 * `viteEnvironment: "ssr"` makes Vite process this project's modules as SSR,
 * so the torpor unplugin resolves `@torpor/view` to its server runtime for
 * shared `.ts`/`.js` helpers (e.g. `@torpor/ui`'s `createItemGroup`, whose
 * `$cache` throws under the client runtime).
 *
 * Client mounting must live in a separate project: with `viteEnvironment:
 * "ssr"`, `mount`/`hydrate` resolve to the server stubs that throw.
 */
export default {
	...builtinEnvironments["happy-dom"],
	name: "ssr-dom",
	viteEnvironment: "ssr",
};
