import LoginData from "./LoginData";
import SetIconData from "./SetIconData";

export default interface Message {
	name: "login" | "logout" | "refresh" | "follow" | "set-icon" | "update" | "delayed-refresh";
	data?: LoginData | SetIconData;
}
