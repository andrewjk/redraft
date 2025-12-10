import { $watch } from "@torpor/view";
import type State from "../types/State";

let $state: State = $watch({
	authenticated: false,
});

export default $state;
