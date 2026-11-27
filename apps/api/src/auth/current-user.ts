/** The signed-in user. The only thing the rest of the api learns from the auth module. */
export interface CurrentUser {
	id: string;
	email: string;
	name: string;
}
