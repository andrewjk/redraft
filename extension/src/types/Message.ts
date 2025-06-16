export interface Message {
	name: "login" | "logout" | "refresh" | "follow" | "set-icon";
	data?: LoginData | SetIconData;
}

export interface MessageResponse {
	ok: boolean;
	error: string;
}

export interface LoginData {
	url: string;
	email: string;
	password: string;
}

export interface SetIconData {
	prefix: string;
}
