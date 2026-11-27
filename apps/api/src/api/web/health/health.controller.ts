import type { HealthResponse } from "@tenora/contracts";
import { Controller, Get } from "@nestjs/common";
import { Public } from "../../../auth/public";

@Controller("health")
export class HealthController {
	@Get()
	@Public()
	getHealth(): HealthResponse {
		return { status: "ok" };
	}
}
