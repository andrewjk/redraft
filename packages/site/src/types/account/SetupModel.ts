export default interface SetupModel {
	username: string;
	password: string;
	confirmPassword: string;
	name: string;
	email: string;
	bio?: string;
	location?: string;
	image?: string;

	imagefile?: string | ArrayBuffer | File | null;
}
