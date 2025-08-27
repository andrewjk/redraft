import type { Database, DatabaseTransaction } from "./database";

export default async function transaction(
	db: Database,
	fn: (tx: Database | DatabaseTransaction) => void,
): Promise<void> {
	// @ts-ignore
	await globalThis.socialAdapter.transaction(db, fn);
}
