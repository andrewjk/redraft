export default interface Storage {
	uploadFile: (file: File, name: string) => Promise<void>;

	deleteFile: (name: string) => Promise<void>;

	getFile: (name: string) => Promise<Response>;
}
