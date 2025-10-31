export default interface ListEditModel {
	id: number;
	name: string;
	description: string;
	users: {
		id: number;
		url: string;
		name: string;
		image: string;
		included: boolean;
	}[];
}
