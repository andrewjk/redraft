// TODO: Figure out how to export this from @torpor/view so it doesn't need to
// be created in every app
declare module "*.torp" {
	import { Component as ComponentType } from "@torpor/view";
	const Component: ComponentType;
	export default Component;
}
