import env from "@/lib/env";

const base = `${env().SITE_LOCATION}api/`;

type SendOptions = {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	params: Record<string, string>;
	data?: any;
	token?: string;
};

// TODO: Make this all type-safe etc

async function send({ method, path, data, token }: SendOptions) {
	console.log("getting api data from", path);

	type RequestOptions = {
		method: string;
		headers: Headers;
		body?: string;
	};

	const options: RequestOptions = {
		method,
		headers: new Headers(),
	};

	if (data || method === "POST") {
		options.headers.append("Content-Type", "application/json");
		options.body = JSON.stringify(data ?? {});
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

export function get(path: string, params: Record<string, string>, token?: string) {
	return send({ method: "GET", path, params, token });
}

export function del(path: string, params: Record<string, string>, token?: string) {
	return send({ method: "DELETE", path, params, token });
}

export function post(path: string, params: Record<string, string>, data: any, token?: string) {
	return send({ method: "POST", path, data, params, token });
}

export function put(path: string, params: Record<string, string>, data: any, token?: string) {
	return send({ method: "PUT", path, data, params, token });
}
