export default interface ProfileViewModel {
	url: string;
	email: string;
	name: string;
	bio: string;
	location: string;
	about: string;
	image: string;
	links: LinkViewModel[];
}

interface LinkViewModel {
	id: number;
	text: string;
	url: string;
}
