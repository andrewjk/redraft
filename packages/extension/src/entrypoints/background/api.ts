export async function get<T>(base: string, path: string, token: string): Promise<T> {
	return api("GET", base, path, null, token);
}

export async function post(base: string, path: string, data: any, token: string): Promise<void> {
	return api("POST", base, path, data, token);
}

/** Sends a request to the API with authentication etc */
async function api(method: "GET" | "POST", base: string, path: string, data: any, token: string) {
	console.log(`sending extension request to '${base}${path}'`);

	type RequestOptions = {
		method: string;
		headers: Headers;
		body?: string;
	};

	const options: RequestOptions = {
		method,
		headers: new Headers(),
	};

	if (data) {
		options.headers.append("Content-Type", "application/json");
		options.body = JSON.stringify(data);
	}

	if (token) {
		options.headers.append("Authorization", `Token ${token}`);
	}

	const result = await fetch(`${base}${path}`, options);

	if (result.ok || result.status === 422) {
		const text = await result.text();
		const data = text ? JSON.parse(text) : {};
		return data;
	}

	throw new Error(result.status.toString());
}
