export interface Storage {
	authenticated: boolean;
	url: string;
	following: Following[];
}

export interface Following {
	approved: boolean;
	url: string;
	shared_key: string;
	token: string;
}
