export default interface ProfileEditModel {
	email: string;
	password: string;
	name: string;
	bio: string;
	about: string;
	location: string;
	image: string;
	links: {
		id: number;
		url: string;
		text: string;
	}[];

	imagefile?: string | ArrayBuffer | File | null;
}
