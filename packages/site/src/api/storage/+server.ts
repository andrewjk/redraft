// I was initially going to stub out some S3 endpoints here but that didn't work
// out. Then I tried using node:fs to save files into assets/content, but that
// seems a bit unsafe. So for now we are saving content straight into the database

//import type { ServerEndPoint } from "@torpor/build";
//import { ok, unauthorized } from "@torpor/build/response";
//import { promises as fs } from "node:fs";
//import path from "node:path";
//
//export default {
//	post: async ({ appData, request }) => {
//		//const user = appData.user;
//		//if (!user) {
//		//	return unauthorized();
//		//}
//		//console.log(request);
//		const data = await request.formData();
//		const file = data.get("file") as File;
//		const name = data.get("name") as string;
//
//		let filepath = path.join(".", "src", "assets", "content", name);
//		let buffer = await file.arrayBuffer();
//		fs.writeFile(filepath, new Int8Array(buffer));
//
//		return ok();
//	},
//} satisfies ServerEndPoint;
//
