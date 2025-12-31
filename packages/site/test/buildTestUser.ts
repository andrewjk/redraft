import createUserToken from "../src/lib/utils/createUserToken";

export default async function buildTestUser(
	code: string,
): Promise<{ token: string; code: string }> {
	const user = {
		url: "",
		username: "",
		name: "",
		image: "",
		token: "",
		code,
	};
	user.token = await createUserToken(user, user.code);
	return user;
}
