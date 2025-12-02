import { describe, expect, it } from "bun:test";

import { formatCNPJ, stripCNPJFormatting, validateCNPJ } from "@agro/shared/validators";

describe("CNPJ Validator", () => {
	describe("validateCNPJ", () => {
		it("should validate a valid formatted CNPJ", () => {
			const result = validateCNPJ("11.222.333/0001-81");
			expect(result).toBe(true);
		});

		it("should validate a valid unformatted CNPJ", () => {
			const result = validateCNPJ("11222333000181");
			expect(result).toBe(true);
		});

		it("should reject an invalid CNPJ with wrong check digits", () => {
			const result = validateCNPJ("11.222.333/0001-99");
			expect(result).toBe(false);
		});

		it("should reject known invalid sequences (all zeros)", () => {
			const result = validateCNPJ("00.000.000/0000-00");
			expect(result).toBe(false);
		});

		it("should reject known invalid sequences (all ones)", () => {
			const result = validateCNPJ("11.111.111/1111-11");
			expect(result).toBe(false);
		});

		it("should reject CNPJ with insufficient digits", () => {
			const result = validateCNPJ("11.222.333");
			expect(result).toBe(false);
		});

		it("should reject CNPJ with excessive digits", () => {
			const result = validateCNPJ("11.222.333/0001-81123");
			expect(result).toBe(false);
		});

		it("should reject empty string", () => {
			const result = validateCNPJ("");
			expect(result).toBe(false);
		});

		it("should handle CNPJ with spaces", () => {
			const result = validateCNPJ("11 222 333 0001 81");
			expect(typeof result).toBe("boolean");
		});
	});

	describe("formatCNPJ", () => {
		it("should format an unformatted valid CNPJ", () => {
			const result = formatCNPJ("11222333000181");
			expect(result).toBe("11.222.333/0001-81");
		});

		it("should handle already formatted CNPJ", () => {
			const result = formatCNPJ("11.222.333/0001-81");
			expect(result).toBe("11.222.333/0001-81");
		});

		it("should return original input for invalid CNPJ", () => {
			const input = "12345";
			const result = formatCNPJ(input);
			expect(result).toBe(input);
		});
	});

	describe("stripCNPJFormatting", () => {
		it("should remove formatting from formatted CNPJ", () => {
			const result = stripCNPJFormatting("11.222.333/0001-81");
			expect(result).toBe("11222333000181");
		});

		it("should handle already unformatted CNPJ", () => {
			const result = stripCNPJFormatting("11222333000181");
			expect(result).toBe("11222333000181");
		});

		it("should remove spaces from CNPJ", () => {
			const result = stripCNPJFormatting("11 222 333 0001 81");
			expect(result).toBe("11222333000181");
		});

		it("should handle mixed formatting", () => {
			const result = stripCNPJFormatting("11.222 333/0001-81");
			expect(result).toBe("11222333000181");
		});
	});
});
