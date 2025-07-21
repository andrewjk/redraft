import { ok } from "@torpor/build/response";

type SendOptions = {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	data?: any;
};

// TODO: Make this all type-safe etc

async function send({ method, path, data }: SendOptions): Promise<Response> {
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

	const response = await fetch(path, options);

	// No response is a good response?
	return response ?? ok();
}

export function getPublic(path: string): Promise<Response> {
	return send({ method: "GET", path });
}

export function delPublic(path: string): Promise<Response> {
	return send({ method: "DELETE", path });
}

export function postPublic(path: string, data: any): Promise<Response> {
	return send({ method: "POST", path, data });
}

export function putPublic(path: string, data: any): Promise<Response> {
	return send({ method: "PUT", path, data });
}
