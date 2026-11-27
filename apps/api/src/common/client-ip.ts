import type { NextFunction, Request, Response } from "express";

/**
 * The one header Better Auth reads the client's address from (`ipAddressHeaders`). We set it
 * ourselves on every request, so a client can't choose its own address for rate limiting or
 * session records.
 */
export const CLIENT_IP_HEADER = "x-tenora-client-ip";

/**
 * `request.ip` is the socket's address, or, behind as many trusted proxies as `trust proxy` says
 * (see app.setup.ts), the address those proxies saw. Never a value the client simply wrote in
 * X-Forwarded-For.
 */
export function overwriteClientIp(request: Request, _response: Response, next: NextFunction) {
	if (request.ip) {
		request.headers[CLIENT_IP_HEADER] = request.ip;
	} else {
		delete request.headers[CLIENT_IP_HEADER];
	}
	next();
}
