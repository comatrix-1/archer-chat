import {
	EmploymentType,
	LocationType,
	SkillCategory,
	SkillProficiency,
} from "@prisma/client";
import { Hono } from "hono";
import { jwt as honoJwt } from "hono/jwt";
import { sign } from "jsonwebtoken";
import {
	mapToEmploymentType,
	mapToLocationType,
	mapToSkillCategory,
	mapToSkillProficiency,
	resumeRoute,
} from "server/api/resume";
import { userContextMiddleware } from "server/middleware/userContext";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	test,
} from "vitest";
import prisma from "~/utils/prisma";

interface CustomContext {
	jwtPayload: { userId: string };
	user: { id: string };
}

process.env.JWT_SECRET = "test-jwt-secret";

console.log("[TEST ENV] NODE_ENV:", process.env.NODE_ENV);
console.log("[TEST ENV] DATABASE_URL:", process.env.DATABASE_URL);

describe("Environment Check", () => {
	it("should be in test environment", () => {
		expect(process.env.NODE_ENV).toBe("test");
	});
});

describe("Resume API Tests", () => {
	let app: Hono<{ Bindings: {}; Variables: CustomContext }>;
	let testUser: any;
	let testResume: any;
	const JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
	beforeAll(async () => {
		app = new Hono<{ Bindings: {}; Variables: CustomContext }>();

		app.use(
			"/api/resume/*",
			honoJwt({
				secret: JWT_SECRET,
				cookie: "token",
			}),
		);
		app.use("/api/resume/*", userContextMiddleware);
		app.route("/api/resume", resumeRoute);
		testUser = await prisma.user.create({
			data: {
				email: "resume_test@example.com",
				password: "password",
				name: "Resume Test User",
				role: "JOBSEEKER",
			},
		});
		const testContact = await prisma.contact.create({
			data: {
				email: "contact@example.com",
				phone: "123-456-7890",
				city: "Test City",
				country: "Test Country",
			},
		});
		testResume = await prisma.resume.create({
			data: {
				userId: testUser.id,
				conversationId: "",
				objective: "Base template objective",
				contactId: testContact.id,
			},
		});
	});
	afterAll(async () => {
		await prisma.licenseCertification.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.honorsAwards.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.project.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.skill.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.experience.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.education.deleteMany({
			where: { resume: { userId: testUser.id } },
		});
		await prisma.resume.deleteMany({ where: { userId: testUser.id } });
		await prisma.contact.deleteMany({
			where: { email: { in: ["contact@example.com", "updated@example.com"] } },
		});
		await prisma.user.delete({ where: { id: testUser.id } });
		await prisma.$disconnect();
	});

	beforeEach(async () => {
		await prisma.resume.upsert({
			where: { id: testResume.id },
			update: {},
			create: {
				id: testResume.id,
				userId: testUser.id,
				conversationId: "",
				objective: "Base template objective",
				contactId: testResume.contactId,
			},
		});
	});

	const generateTestToken = (userId: string) => {
		return sign({ userId: userId }, JWT_SECRET);
	};

	describe("GET /api/resume", () => {
		test("should return the base resume template for the user", async () => {
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.resume).toBeDefined();
			expect(body.resume.userId).toBe(testUser.id);
			expect(body.resume.conversationId).toBe("");
		});
		test("should create a new base resume template if one does not exist", async () => {
			await prisma.resume.delete({
				where: { id: testResume.id },
			});
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.resume).toBeDefined();
			expect(body.resume.userId).toBe(testUser.id);
			expect(body.resume.conversationId).toBe("");
			testResume = body.resume;
		});
		test("should return 401 if no token is provided", async () => {
			const response = await app.request("/api/resume", { method: "GET" });
			expect(response.status).toBe(401);
		});
	});
	describe("POST /api/resume", () => {
		test("should update the resume data", async () => {
			const token = generateTestToken(testUser.id);
			const updatedObjective = "Updated objective for testing";
			const updatedResumeData = {
				id: testResume.id,
				userId: testUser.id,
				conversationId: "",
				objective: updatedObjective,
				contact: {
					id: testResume.contactId,
					email: "updated@example.com",
					phone: "987-654-3210",
					city: "Updated City",
					country: "Updated Country",
				},
				experiences: [],
				educations: [],
				skills: [],
				honorsAwards: [],
				licenseCertifications: [],
				projects: [],
			};
			const response = await app.request("/api/resume", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resume: updatedResumeData }),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.resume.objective).toBe(updatedObjective);
			const updatedContact = await prisma.contact.findUnique({
				where: { id: testResume.contactId },
			});
			expect(updatedContact?.email).toBe("updated@example.com");
			await prisma.resume.update({
				where: { id: testResume.id },
				data: { objective: "Base template objective" },
			});
		});
		test("should return 401 if the user is not authenticated", async () => {
			const response = await app.request("/api/resume", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resume: {} }),
			});
			expect(response.status).toBe(401);
		});
		test("should handle errors when updating the resume", async () => {
			const token = generateTestToken(testUser.id);
			const invalidResumeData = {
				id: "invalid-resume-id-that-does-not-exist",
				userId: testUser.id,
				conversationId: "",
				objective: "This will cause an error",
				contact: {
					id: testResume.contactId,
					email: "error_case_contact@example.com",
					phone: "987-654-3210",
					city: "Updated City",
					country: "Updated Country",
				},
				experiences: [],
				educations: [],
				skills: [],
				honorsAwards: [],
				licenseCertifications: [
					{
						name: "Faulty Certification to Trigger Error",
						issuer: "Error Corp",
						issueDate: new Date().toISOString(),
					},
				],
				projects: [],
			};
			const response = await app.request("/api/resume", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resume: invalidResumeData }),
			});
			expect(response.status).toBe(500);
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.message).toBe("Failed to update resume");
			expect(body.error).toBeDefined();
		});
		test("should handle empty lists of nested data", async () => {
			const token = generateTestToken(testUser.id);
			const testResumeData = {
				...testResume,
				objective: "Objective with empty lists",
				contact: {
					id: testResume.contactId,
					email: "updated@example.com",
					phone: "987-654-3210",
					city: "Updated City",
					country: "Updated Country",
				},
				experiences: [],
				educations: [],
				skills: [],
				honorsAwards: [],
				licenseCertifications: [],
				projects: [],
			};

			const response = await app.request("/api/resume", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resume: testResumeData }),
			});

			expect(response.status).toBe(200);
			const responseBody = await response.json();
			expect(responseBody.success).toBe(true);

			const updatedResume = await prisma.resume.findUnique({
				where: { id: testResume.id },
				include: {
					experiences: true,
					educations: true,
					skills: true,
					honorsAwards: true,
					licenseCertifications: true,
					projects: true,
				},
			});

			expect(updatedResume?.experiences).toHaveLength(0);
			expect(updatedResume?.educations).toHaveLength(0);
			expect(updatedResume?.skills).toHaveLength(0);
			expect(updatedResume?.honorsAwards).toHaveLength(0);
			expect(updatedResume?.licenseCertifications).toHaveLength(0);
			expect(updatedResume?.projects).toHaveLength(0);
		});
	});
	describe("Concurrent Updates", () => {
		test("should handle concurrent updates to the same resume", async () => {
			const token = generateTestToken(testUser.id);

			const update1 = {
				...testResume,
				objective: "First concurrent update",
			};

			const update2 = {
				...testResume,
				objective: "Second concurrent update",
			};

			const [response1, response2] = await Promise.all([
				app.request("/api/resume", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ resume: update1 }),
				}),
				app.request("/api/resume", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ resume: update2 }),
				}),
			]);

			expect(response1.status).toBe(200);
			expect(response2.status).toBe(200);

			const finalResume = await prisma.resume.findUnique({
				where: { id: testResume.id },
			});

			expect(["First concurrent update", "Second concurrent update"]).toContain(
				finalResume?.objective,
			);
		});
	});

	describe("PUT /api/resume", () => {
		test("should update the user and resume data", async () => {
			const token = generateTestToken(testUser.id);
			const updatedData = {
				email: "updated_resume_test@example.com",
				name: "Updated Name",
				role: "RECRUITER",
				contactId: testResume.contactId,
			};
			const response = await app.request("/api/resume", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedData),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toBeDefined();
			const updatedUser = await prisma.user.findUnique({
				where: { id: testUser.id },
			});
			expect(updatedUser?.email).toBe("updated_resume_test@example.com");
			expect(updatedUser?.name).toBe("Updated Name");
			expect(updatedUser?.role).toBe("RECRUITER");
			await prisma.user.update({
				where: { id: testUser.id },
				data: {
					email: "resume_test@example.com",
					name: "Resume Test User",
					role: "JOBSEEKER",
				},
			});
		});
		test("should return 400 if email and contactId are missing", async () => {
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toBe("Email and contactId are required");
		});
	});
	describe("POST /api/resume/generate", () => {
		test("should return a generated resume and cover letter", async () => {
			const token = generateTestToken(testUser.id);
			const generateData = {
				title: "Software Engineer",
				jobDescription: "Looking for a skilled software engineer",
			};
			const response = await app.request("/api/resume/generate", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(generateData),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.resume).toBeDefined();
			expect(body.coverLetter).toBeDefined();
		});
		test("should return 401 if the user is not authenticated", async () => {
			const response = await app.request("/api/resume/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});
			expect(response.status).toBe(401);
		});
	});
	describe("GET /api/resume/list", () => {
		test("should return a list of resumes for the user", async () => {
			const token = generateTestToken(testUser.id);

			const contact1ForList = await prisma.contact.create({
				data: {
					email: `contact1_for_list_test_${Date.now()}@example.com`,
				},
			});
			const contact2ForList = await prisma.contact.create({
				data: {
					email: `contact2_for_list_test_${Date.now() + 1}@example.com`,
				},
			});

			await prisma.resume.createMany({
				data: [
					{
						userId: testUser.id,
						conversationId: "conversation1",
						objective: "Test resume 1",
						contactId: contact1ForList.id,
					},
					{
						userId: testUser.id,
						conversationId: "conversation2",
						objective: "Test resume 2",
						contactId: contact2ForList.id,
					},
				],
			});
			const response = await app.request("/api/resume/list", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(Array.isArray(body.resumes)).toBe(true);
			expect(body.resumes.length).toBeGreaterThanOrEqual(2);
			await prisma.resume.deleteMany({
				where: {
					userId: testUser.id,
					conversationId: { in: ["conversation1", "conversation2"] },
				},
			});
		});
		test("should return an empty list if no resumes are found", async () => {
			await prisma.resume.deleteMany({
				where: {
					userId: testUser.id,
					conversationId: { not: "" },
				},
			});
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume/list", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(Array.isArray(body.resumes)).toBe(true);
			expect(body.resumes.length).toBe(0);

			await prisma.resume.deleteMany({
				where: {
					userId: testUser.id,
					conversationId: "",
				},
			});

			testResume = await prisma.resume.create({
				data: {
					user: { connect: { id: testUser.id } },
					conversationId: "",
					objective: "Base template objective",
					contact: {
						create: {
							email: `base_contact_${Date.now()}@example.com`,
						},
					},
				},
			});
		});
	});
	describe("Helper Functions", () => {
		describe("mapToEmploymentType", () => {
			test("maps string values to EmploymentType enum", () => {
				expect(mapToEmploymentType("FULL_TIME")).toBe(EmploymentType.FULL_TIME);
				expect(mapToEmploymentType("PART_TIME")).toBe(EmploymentType.PART_TIME);
				expect(mapToEmploymentType("CONTRACT")).toBe(EmploymentType.CONTRACT);
				expect(mapToEmploymentType("INTERNSHIP")).toBe(
					EmploymentType.INTERNSHIP,
				);
				expect(mapToEmploymentType(undefined)).toBe(EmploymentType.FULL_TIME);
				expect(mapToEmploymentType("INVALID_TYPE")).toBe(
					EmploymentType.FULL_TIME,
				);
			});
		});

		describe("mapToLocationType", () => {
			test("maps string values to LocationType enum", () => {
				expect(mapToLocationType("ON_SITE")).toBe(LocationType.ON_SITE);
				expect(mapToLocationType("HYBRID")).toBe(LocationType.HYBRID);
				expect(mapToLocationType("REMOTE")).toBe(LocationType.REMOTE);
				expect(mapToLocationType(undefined)).toBe(LocationType.ON_SITE);
				expect(mapToLocationType("INVALID_TYPE")).toBe(LocationType.ON_SITE);
			});
		});

		describe("mapToSkillCategory", () => {
			test("maps string values to SkillCategory enum", () => {
				expect(mapToSkillCategory("TECHNICAL")).toBe(SkillCategory.TECHNICAL);
				expect(mapToSkillCategory("SOFT")).toBe(SkillCategory.SOFT);
				expect(mapToSkillCategory("LANGUAGE")).toBe(SkillCategory.LANGUAGE);
				expect(mapToSkillCategory(undefined)).toBe(SkillCategory.TECHNICAL);
				expect(mapToSkillCategory("INVALID_CATEGORY")).toBe(
					SkillCategory.TECHNICAL,
				);
			});
		});

		describe("mapToSkillProficiency", () => {
			test("maps string values to SkillProficiency enum", () => {
				expect(mapToSkillProficiency("BEGINNER")).toBe(
					SkillProficiency.BEGINNER,
				);
				expect(mapToSkillProficiency("INTERMEDIATE")).toBe(
					SkillProficiency.INTERMEDIATE,
				);
				expect(mapToSkillProficiency("ADVANCED")).toBe(
					SkillProficiency.ADVANCED,
				);
				expect(mapToSkillProficiency("EXPERT")).toBe(SkillProficiency.EXPERT);
				expect(mapToSkillProficiency(undefined)).toBe(
					SkillProficiency.INTERMEDIATE,
				);
				expect(mapToSkillProficiency("INVALID_PROFICIENCY")).toBe(
					SkillProficiency.INTERMEDIATE,
				);
			});
		});
	});

	describe("GET /api/resume/:id", () => {
		test("should return a specific resume by ID", async () => {
			const token = generateTestToken(testUser.id);
			const testResume2 = await prisma.resume.create({
				data: {
					user: {
						connect: { id: testUser.id },
					},
					conversationId: "conversation3",
					objective: "Specific resume test",
					contact: {
						create: {
							email: `contact_for_resume2_get_test_${Date.now()}@example.com`,
						},
					},
				},
			});
			const response = await app.request(`/api/resume/${testResume2.id}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.resume).toBeDefined();
			expect(body.resume.id).toBe(testResume2.id);
			await prisma.resume.delete({ where: { id: testResume2.id } });
		});
		test("should return 404 if the resume is not found", async () => {
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume/nonexistent-id", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(404);
		});
	});
	describe("DELETE /api/resume/:id", () => {
		test("should delete a specific resume by ID", async () => {
			const token = generateTestToken(testUser.id);
			const testResume3 = await prisma.resume.create({
				data: {
					user: {
						connect: { id: testUser.id },
					},
					conversationId: "conversation4",
					objective: "Resume to be deleted",
					contact: {
						create: {
							email: `contact_for_resume3_to_delete_${Date.now()}@example.com`,
						},
					},
				},
			});
			const response = await app.request(`/api/resume/${testResume3.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.message).toBe("Resume deleted successfully");
			const deletedResume = await prisma.resume.findUnique({
				where: { id: testResume3.id },
			});
			expect(deletedResume).toBeNull();
		});
		test("should return 404 if the resume is not found", async () => {
			const token = generateTestToken(testUser.id);
			const response = await app.request("/api/resume/nonexistent-id", {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			expect(response.status).toBe(404);
		});
	});
});
