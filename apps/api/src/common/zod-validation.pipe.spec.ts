import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
	const pipe = new ZodValidationPipe(z.object({ name: z.string().min(1) }));

	it("returns the parsed value", () => {
		expect(pipe.transform({ name: "x", extra: 1 })).toEqual({ name: "x" });
	});

	it("answers 400 listing what is wrong", () => {
		let thrown: unknown;
		try {
			pipe.transform({});
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeInstanceOf(BadRequestException);
		expect((thrown as BadRequestException).getResponse()).toMatchObject({
			message: "Validation failed",
			issues: [{ path: "name" }],
		});
	});
});
