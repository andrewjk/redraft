// Declares `.torp?client` and `.torp?server` files for TypeScript, so that
// the unplugin's per-import compile overrides (see vitest.config.ts) get the
// right types in interactive tests:
//
// - `?client` gives a component that can be mounted or hydrated
// - `?server` gives an async function that renders the component's HTML
//   (`{ body, head }`), for hydrate tests to attach to
declare module "*.torp?client" {
	import { Component as ComponentType } from "@torpor/view";
	const Component: ComponentType;
	export default Component;
}

declare module "*.torp?server" {
	const component: (props: any) => Promise<{ body: string; head: string }>;
	export default component;
}
