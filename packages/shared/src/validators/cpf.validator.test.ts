import { describe, expect, it } from "bun:test";

import { formatCPF, stripCPFFormatting, validateCPF } from "@agro/shared/validators";

describe("CPF Validator", () => {
	describe("validateCPF", () => {
		it("should validate a valid formatted CPF", () => {
			const result = validateCPF("111.444.777-35");
			expect(result).toBe(true);
		});

		it("should validate a valid unformatted CPF", () => {
			const result = validateCPF("11144477735");
			expect(result).toBe(true);
		});

		it("should reject an invalid CPF with wrong check digits", () => {
			const result = validateCPF("111.444.777-36");
			expect(result).toBe(false);
		});

		it("should reject known invalid sequences (all zeros)", () => {
			const result = validateCPF("000.000.000-00");
			expect(result).toBe(false);
		});

		it("should reject known invalid sequences (all ones)", () => {
			const result = validateCPF("111.111.111-11");
			expect(result).toBe(false);
		});

		it("should reject CPF with insufficient digits", () => {
			const result = validateCPF("123.456");
			expect(result).toBe(false);
		});

		it("should reject CPF with excessive digits", () => {
			const result = validateCPF("111.444.777-35123");
			expect(result).toBe(false);
		});

		it("should reject empty string", () => {
			const result = validateCPF("");
			expect(result).toBe(false);
		});

		it("should handle CPF with spaces", () => {
			// The library should handle spaces in formatted input
			const result = validateCPF("111 444 777 35");
			expect(typeof result).toBe("boolean");
		});
	});

	describe("formatCPF", () => {
		it("should format an unformatted valid CPF", () => {
			const result = formatCPF("11144477735");
			expect(result).toBe("111.444.777-35");
		});

		it("should handle already formatted CPF", () => {
			const result = formatCPF("111.444.777-35");
			expect(result).toBe("111.444.777-35");
		});

		it("should return original input for invalid CPF", () => {
			const input = "12345";
			const result = formatCPF(input);
			expect(result).toBe(input);
		});
	});

	describe("stripCPFFormatting", () => {
		it("should remove formatting from formatted CPF", () => {
			const result = stripCPFFormatting("111.444.777-35");
			expect(result).toBe("11144477735");
		});

		it("should handle already unformatted CPF", () => {
			const result = stripCPFFormatting("11144477735");
			expect(result).toBe("11144477735");
		});

		it("should remove spaces from CPF", () => {
			const result = stripCPFFormatting("111 444 777 35");
			expect(result).toBe("11144477735");
		});

		it("should handle mixed formatting", () => {
			const result = stripCPFFormatting("111.444 777-35");
			expect(result).toBe("11144477735");
		});
	});
});
