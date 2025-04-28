export default interface Adapter {
	// TODO: db, storage, etc

	// We won't know what type of database we have until we know the schema, so
	// we'll just have to cast it then
	database: (schema: any) => any;
}
