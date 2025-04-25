type SendOptions = {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	data?: any;
};

// TODO: Make this all type-safe etc

async function send({ method, path, data }: SendOptions) {
	console.log("sending data to", path);

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

	const result = await fetch(path, options);

	if (result.ok || result.status === 422) {
		const text = await result.text();
		return text ? JSON.parse(text) : {};
	}

	throw new Error(result.status.toString());
}

export function getPublic(path: string) {
	return send({ method: "GET", path });
}

export function delPublic(path: string) {
	return send({ method: "DELETE", path });
}

export function postPublic(path: string, data: any) {
	return send({ method: "POST", path, data });
}

export function putPublic(path: string, data: any) {
	return send({ method: "PUT", path, data });
}
