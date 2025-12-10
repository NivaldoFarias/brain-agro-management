import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import request from "supertest";

import { DEMO_CREDENTIALS } from "@agro/shared/constants";

import { AppModule } from "@/app.module";

describe("AuthController (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("POST /auth/login", () => {
		it("should return JWT token for valid credentials", async () => {
			const loginDto = {
				email: DEMO_CREDENTIALS.username,
				password: DEMO_CREDENTIALS.password,
			};

			const response = await request(app.getHttpServer())
				.post("/api/auth/login")
				.send(loginDto)
				.expect(HttpStatus.OK);

			expect(response.body).toHaveProperty("accessToken");
			expect(typeof response.body.accessToken).toBe("string");
		});

		it("should reject request with invalid credentials", async () => {
			const loginDto = {
				email: DEMO_CREDENTIALS.username,
				password: "wrongpassword",
			};

			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send(loginDto)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it("should reject request with invalid email", async () => {
			const loginDto = {
				email: "invalid-email",
				password: "test123",
			};

			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should reject request with short password", async () => {
			const loginDto = {
				email: "test@example.com",
				password: "123",
			};

			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("Protected Routes", () => {
		let validToken: string;

		beforeAll(async () => {
			const loginDto = {
				email: DEMO_CREDENTIALS.username,
				password: DEMO_CREDENTIALS.password,
			};

			const response = await request(app.getHttpServer()).post("/api/auth/login").send(loginDto);

			validToken = response.body.accessToken;
		});

		it("should allow access to protected route with valid token", async () => {
			await request(app.getHttpServer())
				.get("/api/producers")
				.set("Authorization", `Bearer ${validToken}`)
				.expect(HttpStatus.OK);
		});

		it("should reject access to protected route without token", async () => {
			await request(app.getHttpServer()).get("/api/producers").expect(HttpStatus.UNAUTHORIZED);
		});

		it("should reject access to protected route with invalid token", async () => {
			await request(app.getHttpServer())
				.get("/api/producers")
				.set("Authorization", "Bearer invalid-token")
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it("should allow access to public routes without token", async () => {
			await request(app.getHttpServer()).get("/api/health").expect(HttpStatus.OK);
		});
	});
});
