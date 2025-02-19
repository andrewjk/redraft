const base = `${process.env.SITE_LOCATION}api/`;

type SendOptions = {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
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

export function get(path: string, token?: string) {
	return send({ method: "GET", path, token });
}

export function del(path: string, token?: string) {
	return send({ method: "DELETE", path, token });
}

export function post(path: string, data: any, token?: string) {
	return send({ method: "POST", path, data, token });
}

export function put(path: string, data: any, token?: string) {
	return send({ method: "PUT", path, data, token });
}
