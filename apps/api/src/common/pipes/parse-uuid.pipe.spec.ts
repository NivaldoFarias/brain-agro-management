import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "bun:test";

import type { ArgumentMetadata } from "@nestjs/common";

import { ParseUUIDPipe } from "./parse-uuid.pipe";

/**
 * @fileoverview Tests for the {@link ParseUUIDPipe}.
 *
 * Verifies UUID validation, error message formatting, and support for UUID v1/v4 formats.
 */
describe("ParseUUIDPipe", () => {
	let pipe: ParseUUIDPipe;

	beforeEach(() => {
		pipe = new ParseUUIDPipe();
	});

	describe("transform", () => {
		it("should return valid UUID unchanged", () => {
			const validUuid = "550e8400-e29b-41d4-a716-446655440000";
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(pipe.transform(validUuid, metadata)).toBe(validUuid);
		});

		it("should throw BadRequestException for invalid UUID format", () => {
			const invalidUuid = "not-a-uuid";
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(() => pipe.transform(invalidUuid, metadata)).toThrow(BadRequestException);
			expect(() => pipe.transform(invalidUuid, metadata)).toThrow(
				"Validation failed: 'id' must be a valid UUID (received: 'not-a-uuid')",
			);
		});

		it("should throw BadRequestException for empty string", () => {
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(() => pipe.transform("", metadata)).toThrow(BadRequestException);
			expect(() => pipe.transform("", metadata)).toThrow(
				"Validation failed: 'id' is required and must be a valid UUID",
			);
		});

		it("should throw BadRequestException for undefined", () => {
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(() => pipe.transform(undefined as unknown as string, metadata)).toThrow(
				BadRequestException,
			);
		});

		it("should include parameter name in error message", () => {
			const invalidUuid = "123";
			const metadata: ArgumentMetadata = { data: "producerId", type: "param" };

			expect(() => pipe.transform(invalidUuid, metadata)).toThrow(
				"Validation failed: 'producerId' must be a valid UUID (received: '123')",
			);
		});

		it("should accept UUID v4 format", () => {
			const uuidV4 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(pipe.transform(uuidV4, metadata)).toBe(uuidV4);
		});

		it("should accept UUID v1 format", () => {
			const uuidV1 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
			const metadata: ArgumentMetadata = { data: "id", type: "param" };

			expect(pipe.transform(uuidV1, metadata)).toBe(uuidV1);
		});
	});
});
