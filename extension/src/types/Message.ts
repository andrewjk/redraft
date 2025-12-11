import LoginData from "./LoginData";
import SetIconData from "./SetIconData";

export default interface Message {
	name:
		| "login"
		| "logout"
		| "refresh"
		| "follow"
		| "unfollow"
		| "set-icon"
		| "update"
		| "delayed-refresh";
	data?: LoginData | SetIconData;
}
