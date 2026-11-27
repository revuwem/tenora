import { Injectable } from "@nestjs/common";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "node:http";
import type { Auth } from "./auth.config";
import type { CurrentUser } from "./current-user";

@Injectable()
export class CurrentUserService {
	constructor(private readonly authService: AuthService<Auth>) {}

	/** The user behind the request's session cookie, or null when there is no valid session. */
	async fromRequest(request: { headers: IncomingHttpHeaders }): Promise<CurrentUser | null> {
		const session = await this.authService.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});
		if (!session) return null;
		const { id, email, name } = session.user;
		return { id, email, name };
	}
}
