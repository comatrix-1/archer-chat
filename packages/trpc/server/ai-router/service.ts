import type { GenerateContentResponse, Schema } from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { jobApplicationService } from "server/job-application-router/service";
import type {
	ZCreateResumeInput,
	ZResumeWithRelations,
	ZSafeResumeWithRelations,
} from "server/resume-router/schema";
import {
	createResumeSchema,
	resumeWithRelationsSchema,
} from "server/resume-router/schema";
import {
	ZAwardSchema,
	ZCertificationSchema,
	ZEducationSchema,
	ZExperienceSchema,
	ZProjectSchema,
	ZSkillSchema,
} from "server/resume-router/schema";
import { z } from "zod";
import {
	generatedResumeSchema,
	type ZGeneratedResume,
	type ZGenerateResumeInput,
} from "./schema";
import { resumeService } from "server/resume-router/service";
import { logToFile } from "./router";

const responseSchema: Schema = {
	type: Type.OBJECT,
	properties: {
		summary: { type: Type.STRING },
		experiences: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					title: { type: Type.STRING },
					employmentType: {
						type: Type.STRING,
						enum: [
							"FULL_TIME",
							"PART_TIME",
							"CONTRACT",
							"INTERNSHIP",
							"FREELANCE",
							"SELF_EMPLOYED",
						],
					},
					company: { type: Type.STRING },
					location: { type: Type.STRING },
					locationType: {
						type: Type.STRING,
						enum: ["ON_SITE", "REMOTE", "HYBRID"],
					},
					startDate: { type: Type.STRING },
					endDate: { type: Type.STRING, nullable: true },
					description: { type: Type.STRING, nullable: true }, // fixed
				},
				required: [
					"title",
					"employmentType",
					"company",
					"location",
					"locationType",
					"startDate",
				],
			},
		},
		educations: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					school: { type: Type.STRING },
					degree: { type: Type.STRING },
					fieldOfStudy: { type: Type.STRING },
					startDate: { type: Type.STRING },
					endDate: { type: Type.STRING, nullable: true },
					gpa: { type: Type.NUMBER, nullable: true },
					gpaMax: { type: Type.NUMBER, nullable: true },
					location: { type: Type.STRING, nullable: true },
					description: { type: Type.STRING },
				},
				required: ["school", "degree", "fieldOfStudy", "startDate", "description"],
				description: "Education description is required and should include details about coursework, achievements, and relevant projects",
			},
		},
		skills: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: { name: { type: Type.STRING } },
				required: ["name"],
			},
		},
		projects: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					title: { type: Type.STRING },
					startDate: { type: Type.STRING },
					endDate: { type: Type.STRING, nullable: true },
					description: { type: Type.STRING, nullable: true },
				},
				required: ["title", "startDate"],
			},
		},
		awards: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					title: { type: Type.STRING },
					issuer: { type: Type.STRING },
					date: { type: Type.STRING, nullable: true },
					description: { type: Type.STRING },
				},
				required: ["title", "issuer"],
			},
		},
		certifications: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					name: { type: Type.STRING },
					issuer: { type: Type.STRING },
					issueDate: { type: Type.STRING },
					expiryDate: { type: Type.STRING, nullable: true },
					credentialId: { type: Type.STRING, nullable: true },
					credentialUrl: { type: Type.STRING, nullable: true },
				},
				required: ["name", "issuer", "issueDate"],
			},
		},
	},
	required: [
		"summary",
		"experiences",
		"educations",
		"skills",
		"projects",
		"awards",
		"certifications",
	],
};

const parseDate = (date: Date | string | null | undefined): Date | null => {
	if (!date) return null;
	return date instanceof Date ? date : new Date(date);
};

const transformExperience = (exp: any) => {
	return {
		id: exp.id,
		title: exp.title,
		company: exp.company,
		startDate: parseDate(exp.startDate) as Date,
		endDate: parseDate(exp.endDate),
		location: exp.location || "",
		employmentType: exp.employmentType,
		locationType: exp.locationType,
		description: exp.description,
	};
};

const transformEducation = (edu: any) => ({
	id: edu.id,
	school: edu.school || "",
	degree: edu.degree || "",
	fieldOfStudy: edu.fieldOfStudy || "",
	startDate: parseDate(edu.startDate) || null,
	endDate: parseDate(edu.endDate) || null,
	location: edu.location || null,
	description: edu.description || null,
	gpa: edu.gpa ?? null,
});

const transformSkill = (skill: any) => ({
	id: skill.id,
	name: skill.name,
});

const transformAward = (award: any) => ({
	id: award.id,
	title: award.title,
	issuer: award.issuer,
	description: award.description,
	date: parseDate(award.date),
});

const transformCertification = (cert: any) => ({
	id: cert.id,
	name: cert.name,
	issuer: cert.issuer,
	issueDate: parseDate(cert.issueDate) as Date,
	expiryDate: parseDate(cert.expiryDate),
	credentialId: cert.credentialId || null,
	credentialUrl: cert.credentialUrl || null,
});

const transformProject = (project: any) => ({
	id: project.id,
	title: project.title,
	startDate: parseDate(project.startDate) as Date,
	endDate: parseDate(project.endDate),
	description: project.description,
});

const transformGeneratedResume = (
	baseResume: Awaited<ReturnType<AIService["getBaseResume"]>>,
	generatedResume: ZGeneratedResume,
): ZSafeResumeWithRelations => {
	return {
		...baseResume,
		experiences: generatedResume.experiences.map((exp) =>
			transformExperience({ ...exp }),
		),
		educations: generatedResume.educations.map((edu) =>
			transformEducation({ ...edu }),
		),
		skills: generatedResume.skills.map((skill) => transformSkill({ ...skill })),
		awards: generatedResume.awards.map((award) => transformAward({ ...award })),
		certifications: generatedResume.certifications.map((cert) =>
			transformCertification({ ...cert }),
		),
		projects: generatedResume.projects.map((project) =>
			transformProject({ ...project }),
		),
	};
};

const prisma = new PrismaClient();
const MAX_RETRIES = 2;

export class AIService {
	private readonly genAI: GoogleGenAI;
	constructor(apiKey: string) {
		this.genAI = new GoogleGenAI({ apiKey });
	}

	async generateResume(
		userId: string,
		input: ZGenerateResumeInput,
	): Promise<ZGeneratedResume> {
		try {
			const baseResume = await this.getBaseResume(userId);
			return await this.generateResumeContent(userId, baseResume, input);
		} catch (error) {
			console.error("Error generating resume:", error);
			throw error;
		}
	}

	private async getBaseResume(userId: string) {
		const resume = await resumeService.getMasterResume(userId);
		if (!resume) {
			throw new Error("Base resume not found");
		}
		return resume;
	}

	private async generateResumeContent(
		userId: string,
		baseResume: Awaited<ReturnType<AIService["getBaseResume"]>>,
		input: ZGenerateResumeInput,
	): Promise<ZGeneratedResume> {
		const jobDescription = await jobApplicationService.getJobDescription(
			input.jobApplicationId,
			userId,
		);

		let attempt = 0;
		let lastError: Error | null = null;

		while (attempt < MAX_RETRIES) {
			try {
				const prompt = this.createResumePrompt(
					jobDescription ?? "",
					baseResume,
					input.customInstructions ?? "",
				);

				logToFile({ type: "AI router service baseResume", resume: baseResume })

				const generatedResume =
					await this.promptGenerativeAi<ZGeneratedResume>(prompt);

				logToFile({ type: "AI router service generated output", resume: generatedResume });

				const transformedResume = transformGeneratedResume(
					baseResume,
					generatedResume,
				);

				const zodParsedResume = generatedResumeSchema.parse(transformedResume);

				console.log(
					"generateResumeContent() - Successfully generated resume: ",
					zodParsedResume,
				);

				return zodParsedResume;
			} catch (error) {
				console.error(`Attempt ${attempt + 1} failed:`, error);
				lastError = error instanceof Error ? error : new Error(String(error));
				attempt++;
				if (attempt < MAX_RETRIES) {
					console.log(`Retrying... (${attempt}/${MAX_RETRIES})`);
				}
			}
		}

		console.error(`All ${MAX_RETRIES} attempts failed.`);
		throw (
			lastError ||
			new Error("Failed to generate resume after multiple attempts.")
		);
	}

	private createResumePrompt(
		jobDescription: string,
		resume: unknown,
		customInstructions?: string,
	): string {
		return `
    You are a professional resume generator. Given the following information (job description, master resume), tailor the following master resume for the job into a resume of approximately 1-2 pages, in JSON format.
    You may re-word and re-phrase the content to make it more suitable for the job description.
    The output must be a valid JSON object that conforms to the provided schema. Some description fields such as experience description have HTML markup, please return the same HTML markup format, while making changes to content as necessary.
    Please ensure the resume is professional, highlights relevant skills and experiences, and is suitable for the specified job title.
    Job Description: ${jobDescription}
    Master Resume: ${JSON.stringify(resume, null, 2)}
    Please approach this step-by-step:
    1. Find key words and phrases from the job description.
    2. Pick the most relevant pieces of content from the master resume, there is no need to include all items.
    3. Tailor the content to make it more suitable for the job description, ensuring keywords are included.
    4. Return the content in JSON format.
    Here are some guidelines for the resume:
    * The resume should be professional and highlight relevant skills and experiences.
    * Each experience item should have between 3-6 bullet points.
    * FOR EDUCATION SECTIONS: You MUST include the description field for each education entry. The description should include details about coursework, achievements, and relevant projects. Maintain the original HTML formatting from the master resume.
    * The resume should be between 1-2 pages long.
    * Make the output as human as possible and Applicant Tracking System (ATS) friendly.
    * Customize the resume to the job post.
    * Use the keywords mentioned in the job post. 
    * IMPORTANT: Do NOT change the company names, job titles, school names, or the dates of employment/education. These details are factual and must remain 100% accurate for legal reasons. For education sections, also preserve the original description content while making it relevant to the job.
    * The education description field is REQUIRED and must be included for each education entry. If the original description is missing, create a detailed one based on the degree and field of study.
    `;
	}

	private async promptGenerativeAi<T>(prompt: string): Promise<T> {
		console.log("promptGenerativeAi() gemini prompt: ", prompt);

		try {
			const response = await this.genAI.models.generateContent({
				model: "gemini-2.0-flash",
				contents: prompt,
				config: {
					temperature: 0.7,
					topP: 0.8,
					topK: 40,
					maxOutputTokens: 2048,
					responseMimeType: "application/json",
					responseSchema,
				},
			});

			console.log("promptGenerativeAi() gemini response: ", response.text);

			if (!response.text) {
				throw new Error("Empty response from AI");
			}

			return this.parseGeminiContentResponseAsJson<T>(response);
		} catch (error) {
			console.error("Error in promptGenerativeAi:", error);
			throw error;
		}
	}

	private parseGeminiContentResponseAsJson<T>(
		response: GenerateContentResponse,
	): T {
		const text = response.text?.trim() || "";
		if (!text) {
			throw new Error("Empty response from AI");
		}

		try {
			// Try to extract JSON from markdown code block if present
			const jsonMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
			const jsonString = jsonMatch ? jsonMatch[1].trim() : text;

			// Parse the JSON string
			const parsedData = JSON.parse(jsonString);

			// Validate with the generatedResumeSchema
			const validatedData = generatedResumeSchema.parse(parsedData);

			console.log(
				"parseGeminiContentResponseAsJson() parsed and validated: ",
				validatedData,
			);

			return validatedData as T;
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("Failed to parse AI response:", errorMessage);
			throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
		}
	}
}

const mockGeneratedResume = {
	summary: "mockGeneratedResume2",
	experiences: [
		{
			title: "Apps Software Engineer",
			employmentType: "FULL_TIME",
			company: "NCS",
			location: "Singapore",
			locationType: "ON_SITE",
			startDate: "2022-09-06T00:00:00.000Z",
			endDate: null,
			description:
				"<ul><li>Developed and maintained 5+ API endpoints using Java and Spring Boot, ensuring high performance and reliability.</li><li>Engineered frontend components using Angular, focusing on creating user-friendly and responsive interfaces.</li><li>Implemented comprehensive unit testing suites using Jest and React-Testing-Library, resulting in a 50% decrease in bugs and increased code stability.</li><li>Conducted security audits using Fortify Application Security and SonarQube, implementing necessary fixes to ensure code quality and security.</li><li>Designed and implemented API endpoints with interactions with Oracle SQL database.</li><li>Utilised Agile methodologies to facilitate efficient project management and iterative development.</li></ul>",
		},
		{
			title: "Content Population Intern",
			employmentType: "FULL_TIME",
			company: "Accenture",
			location: "Singapore",
			locationType: "REMOTE",
			startDate: "2021-01-01T00:00:00.000Z",
			endDate: "2022-05-01T00:00:00.000Z",
			description:
				"<ul><li>Collaborated across 3+ functional groups to author and standardize over 300 web pages and 2000+ FAQ pages.</li><li>Developed an internal bug-raising process, improving bug-related efficiency by 50%.</li><li>Trained 2 interns and 3+ employees on content authoring using Adobe Experience Manager.</li><li>Communicated and resolved queries raised through 1000+ bugs with relevant stakeholders.</li><li>Managed project tasks and bug-tracking deliverables efficiently in an Agile Scrum team with Azure DevOps.</li></ul>",
		},
	],
	educations: [
		{
			school: "Bachelor of Business Management",
			degree: "Singapore Management University",
			fieldOfStudy: "Businses Management",
			startDate: "2018-08-01T00:00:00.000Z",
			endDate: "2022-05-01T00:00:00.000Z",
			gpa: 3.72,
			location: null,
			description: null,
		},
	],
	skills: [
		{
			name: "HTML",
		},
		{
			name: "CSS",
		},
		{
			name: "Javascript",
		},
		{
			name: "React",
		},
		{
			name: "Java",
		},
		{
			name: "Spring Boot",
		},
		{
			name: "Angular",
		},
		{
			name: "Jenkins",
		},
		{
			name: "Docker",
		},
		{
			name: "SQL",
		},
		{
			name: "Azure DevOps",
		},
		{
			name: "Agile Methodologies",
		},
	],
	projects: [
		{
			title: "Inventory Management Project – Cloud Native Solution on AWS",
			startDate: "2023-08-01T00:00:00.000Z",
			endDate: "2023-11-01T00:00:00.000Z",
		},
		{
			title: "Portfolio Project - Weather App",
			startDate: "2025-01-01T00:00:00.000Z",
			endDate: "2025-01-01T00:00:00.000Z",
		},
		{
			title: "Side Project – Hyqueue on Github, fork of QueueSG",
			startDate: "2025-08-31T12:44:05.198Z",
			endDate: null,
		},
	],
	awards: [
		{
			title: "Country Champion (Singapore)",
			issuer: "The 3M Inspire Challenge 2021",
			date: "2021-08-01T00:00:00.000Z",
		},
	],
	certifications: [
		{
			name: "Microsoft Certified Azure Developer Associate – Microsoft",
			issuer: "Microsoft",
			issueDate: "2025-06-21T00:00:00.000Z",
			expiryDate: "2026-06-21T00:00:00.000Z",
			credentialId: null,
			credentialUrl: null,
		},
		{
			name: "Microsoft Azure Fundamentals (AZ-900)",
			issuer: "Microsoft",
			issueDate: "2023-12-02T00:00:00.000Z",
			expiryDate: null,
			credentialId: null,
			credentialUrl: null,
		},
		{
			name: "Professional Scrum Master™ I (PSM I)",
			issuer: "scrum.org",
			issueDate: "2022-09-01T00:00:00.000Z",
			expiryDate: null,
			credentialId: null,
			credentialUrl: null,
		},
	],
};
