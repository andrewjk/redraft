import database from "@/data/database";
import { contentTable } from "@/data/schema";
import { notFound } from "@torpor/build/response";
import { eq } from "drizzle-orm";

export default async function contentGet(name: string) {
	const db = database();

	// Get the content from the database
	//const name = url.searchParams.get("name");
	//if (!name) {
	//	return notFound();
	//}

	const content = await db.query.contentTable.findFirst({
		where: eq(contentTable.name, name),
	});
	if (!content) {
		return notFound();
	}

	return new Response(content.content as any);
}
