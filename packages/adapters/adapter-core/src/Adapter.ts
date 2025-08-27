import type Images from "./Images";
import type Storage from "./Storage";

export default interface Adapter {
	// We won't know what type of database we have until we know the schema, so
	// we'll just have to cast it then
	database: (schema: any) => any;

	// Some databases (D1!) don't support transactions, so it has to be optional
	transaction: (db: any, fn: (tx: any) => Promise<unknown>) => Promise<unknown>;

	storage: Storage;

	images: Images;

	// TODO: queue, emails
}
