import { Storage } from "@redraft/adapter-core";

export default function storage(): Storage {
	// @ts-ignore
	return globalThis.socialAdapter?.storage as Storage;
}
