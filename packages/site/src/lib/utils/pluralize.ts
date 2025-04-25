export default function pluralize(number: number, name: string) {
	return `${number} ${name}${number !== 1 ? "s" : ""}`;
}
