export default interface State {
	authenticated: boolean;
	user?: {
		image: string;
		url: string;
		name: string;
	};
	messageCount?: number;
	notificationCount?: number;
	viewing?: {
		image: string;
		url: string;
		name: string;
		following: boolean;
		requested: boolean;
	};
	following?: {
		image: string;
		url: string;
		name: string;
		token: string;
	}[];
	requested?: {
		image: string;
		url: string;
		name: string;
		token: string;
	}[];
	login?: (e: SubmitEvent) => void;
	loginError?: string;
	logout?: (e: SubmitEvent) => void;
	logoutError?: string;
	refresh?: (e: SubmitEvent) => void;
	refreshError?: string;
	follow?: (e: SubmitEvent) => void;
	followError?: string;
	followMessage?: string;
	unfollow?: (e: SubmitEvent) => void;
	unfollowError?: string;
	unfollowMessage?: string;
}
