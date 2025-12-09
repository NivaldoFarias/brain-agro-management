import { describe, expect, it } from "bun:test";

import { assertValidFarmArea, validateFarmArea } from "@agro/shared/validators";

describe("Farm Area Validator", () => {
	describe("validateFarmArea", () => {
		describe("valid scenarios", () => {
			it("should validate when arable + vegetation equals total area", () => {
				const result = validateFarmArea(100, 60, 40);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate when arable + vegetation is less than total area", () => {
				const result = validateFarmArea(100, 60, 30);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with zero arable area", () => {
				const result = validateFarmArea(100, 0, 50);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with zero vegetation area", () => {
				const result = validateFarmArea(100, 50, 0);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with both areas as zero", () => {
				const result = validateFarmArea(100, 0, 0);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with decimal areas", () => {
				const result = validateFarmArea(100.5, 60.25, 30.75);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with very small areas", () => {
				const result = validateFarmArea(0.5, 0.2, 0.3);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});

			it("should validate with very large areas", () => {
				const result = validateFarmArea(999999.99, 600000, 300000);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});
		});

		describe("total area validation", () => {
			it("should reject when total area is zero", () => {
				const result = validateFarmArea(0, 30, 20);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Total area must be greater than 0");
			});

			it("should reject when total area is negative", () => {
				const result = validateFarmArea(-50, 30, 20);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Total area must be greater than 0");
			});
		});

		describe("arable area validation", () => {
			it("should reject when arable area is negative", () => {
				const result = validateFarmArea(100, -10, 30);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Arable area cannot be negative");
			});
		});

		describe("vegetation area validation", () => {
			it("should reject when vegetation area is negative", () => {
				const result = validateFarmArea(100, 30, -10);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Vegetation area cannot be negative");
			});
		});

		describe("sum validation", () => {
			it("should reject when sum exceeds total area", () => {
				const result = validateFarmArea(100, 70, 40);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain(
					"Sum of arable and vegetation areas (110.00 ha) exceeds total area (100.00 ha)",
				);
			});

			it("should reject when sum is just slightly over total", () => {
				const result = validateFarmArea(100, 60, 40.01);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("exceeds total area");
			});

			it("should reject with decimal overflow", () => {
				const result = validateFarmArea(99.99, 60, 40);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("exceeds total area");
			});
		});

		describe("error message format", () => {
			it("should include precise decimal values in error message", () => {
				const result = validateFarmArea(100.5, 60.3, 50.1);
				expect(result.error).toContain("110.40");
				expect(result.error).toContain("100.50");
			});
		});
	});

	describe("assertValidFarmArea", () => {
		it("should not throw for valid areas", () => {
			expect(() => {
				assertValidFarmArea(100, 60, 30);
			}).not.toThrow();
		});

		it("should throw with descriptive message for invalid total area", () => {
			expect(() => {
				assertValidFarmArea(0, 30, 20);
			}).toThrow("Total area must be greater than 0");
		});

		it("should throw with descriptive message for negative arable area", () => {
			expect(() => {
				assertValidFarmArea(100, -10, 30);
			}).toThrow("Arable area cannot be negative");
		});

		it("should throw with descriptive message for negative vegetation area", () => {
			expect(() => {
				assertValidFarmArea(100, 30, -10);
			}).toThrow("Vegetation area cannot be negative");
		});

		it("should throw with descriptive message for exceeding sum", () => {
			expect(() => {
				assertValidFarmArea(100, 70, 40);
			}).toThrow("Sum of arable and vegetation areas (110.00 ha) exceeds total area (100.00 ha)");
		});

		it("should throw with the exact error message from validateFarmArea", () => {
			try {
				assertValidFarmArea(50, 40, 20);
				expect.unreachable("Should have thrown");
			} catch (error) {
				const validationResult = validateFarmArea(50, 40, 20);
				expect((error as Error).message).toBe(validationResult.error ?? "");
			}
		});
	});

	describe("edge cases", () => {
		it("should handle floating point precision issues (Common floating point issue: 0.1 + 0.2 !== 0.3)", () => {
			const result = validateFarmArea(100, 0.1 + 0.2, 99.7);
			expect(result.isValid).toBe(true);
		});

		it("should handle very small differences", () => {
			const result = validateFarmArea(100, 60, 40.00001);
			expect(result.isValid).toBe(false);
		});

		it("should accept exact match with floating point", () => {
			const total = 100.25;
			const arable = 60.15;
			const vegetation = 40.1;
			const result = validateFarmArea(total, arable, vegetation);
			expect(result.isValid).toBe(true);
		});
	});
});
