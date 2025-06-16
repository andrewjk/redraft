export interface Storage {
	authenticated: boolean;
	url: string;
	following: Following[];
}

export interface Following {
	url: string;
	shared_key: string;
	token: string;
}
