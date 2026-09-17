export interface Storage {
	authenticated: boolean;
	url: string;
	email: string;
	domain: string | null;
	token: string;
	profile: {
		image: string;
		url: string;
		name: string;
	};
	following: Following[];
	notificationCount: number;
	messageCount: number;
	loadedAt: number;
	viewing: Viewing | null;
	showFollow: boolean;
	showInfo: boolean;
}

export interface Following {
	approved: boolean;
	url: string;
	name: string;
	image: string;
	shared_key: string;
	token: string;
}

export interface Viewing {
	url: string;
	name?: string;
	image?: string;
	following: boolean;
	requested: boolean;
}
