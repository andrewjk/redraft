import type { Images } from "@redraft/adapter-core";
import { promises as fs } from "node:fs";
import path from "node:path";
import bufferToArrayBuffer from "./bufferToArrayBuffer";

const images: Images = {
	// TODO: resizing etc
	async getImage(
		name: string,
		// @ts-ignore
		width: number,
		// @ts-ignore
		height: number,
	): Promise<Response> {
		const filename = path.resolve(`./content/${name}`);
		const content = await fs.readFile(filename);
		const response = new Response(bufferToArrayBuffer(content));
		return response;
	},
};

export default images;
