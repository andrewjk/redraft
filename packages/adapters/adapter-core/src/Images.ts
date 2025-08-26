export default interface Images {
	getImage: (name: string, width: number, height: number) => Promise<Response>;
}
