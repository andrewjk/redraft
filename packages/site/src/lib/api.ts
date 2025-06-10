import { ServerEndPoint, ServerLoadEvent } from "@torpor/build";
import { CookieHelper, HeaderHelper } from "@torpor/build/server";
import env from "../lib/env";
import hook from "../routes/api/_hook.server";
import ensureSlash from "./utils/ensureSlash";

type SendOptions = {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	endpoint: ServerEndPoint;
	params: Record<string, string>;
	data?: any;
	token?: string;
};

// TODO: Make this all type-safe etc

async function send({ method, path, endpoint, data, token }: SendOptions) {
	console.log("getting api data from", path);

	const base = `${ensureSlash(env().SITE_LOCATION)}api/`;

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

	// Don't fetch -- we can call the endpoints directly
	//const result = await fetch(`${base}${path}`, options);

	// Parse out params from the path, in the form of e.g. `[slug=123]`
	let params: Record<string, string> = {};
	let pathParts = path.split("/");
	for (let i = 0; i < pathParts.length; i++) {
		if (pathParts[i].startsWith("[") && pathParts[i].endsWith("]") && pathParts[i].includes("=")) {
			const parts = pathParts[i].substring(1, pathParts[i].length - 1).split("=");
			params[parts[0]] = parts[1];
			pathParts[i] = `[${parts[0]}]`;
		}
	}
	path = pathParts.join("/");

	const url = new URL(`${base}${path}`);
	const request = new Request(url, options);
	const ev: ServerLoadEvent = {
		url,
		params,
		appData: {},
		request,
		cookies: new CookieHelper(request),
		headers: new HeaderHelper(request),
		adapter: {},
	};
	hook.handle(ev);
	const response =
		method === "GET"
			? await endpoint.get!(ev)
			: method === "POST"
				? await endpoint.post!(ev)
				: method === "PUT"
					? await endpoint.put!(ev)
					: method === "DELETE"
						? await endpoint.del!(ev)
						: undefined;

	if (response) {
		if (response.ok || response.status === 422) {
			const text = await response.text();
			const data = text ? JSON.parse(text) : {};
			return data;
		}
	}

	throw new Error(response?.status.toString());
}

export function get(
	path: string,
	endpoint: ServerEndPoint,
	params: Record<string, string>,
	token?: string,
) {
	return send({ method: "GET", path, endpoint, params, token });
}

export function del(
	path: string,
	endpoint: ServerEndPoint,
	params: Record<string, string>,
	token?: string,
) {
	return send({ method: "DELETE", path, endpoint, params, token });
}

export function post(
	path: string,
	endpoint: ServerEndPoint,
	params: Record<string, string>,
	data: any,
	token?: string,
) {
	return send({ method: "POST", path, endpoint, data, params, token });
}

export function put(
	path: string,
	endpoint: ServerEndPoint,
	params: Record<string, string>,
	data: any,
	token?: string,
) {
	return send({ method: "PUT", path, endpoint, data, params, token });
}
