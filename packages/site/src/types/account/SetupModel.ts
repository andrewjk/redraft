export default interface SetupModel {
	username: string;
	password: string;
	name: string;
	email: string;
	bio?: string;
	location?: string;
	image?: string;

	imagefile?: string | ArrayBuffer | File | null;
}
