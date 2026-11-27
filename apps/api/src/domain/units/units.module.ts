import { Module } from "@nestjs/common";
import { UnitsRepository } from "./units.repository";
import { UnitsService } from "./units.service";

@Module({
	providers: [UnitsRepository, UnitsService],
	exports: [UnitsService],
})
export class UnitsModule {}
