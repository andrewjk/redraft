import type UserModel from "./UserModel";

export default interface AppData {
	/**
	 * The user that is logged in, which is loaded from a cookie.
	 */
	user?: UserModel;
}
