import type { GenerateContentResponse } from "@google/genai";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { logger } from "@project/logging/src";
import { jobApplicationService } from "server/job-application-router/service";
import type {
	ZSafeResumeWithRelations
} from "server/resume-router/schema";
import { resumeService } from "server/resume-router/service";
import { logToFile } from "./router";
import {
	type ZGenerateResumeInput,
	type ZGeneratedResume,
	generatedResumeSchema,
} from "./schema";

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
const MAX_RETRIES = 1;

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
				);

				logToFile({ type: "info", resume: baseResume });
				const generatedResume =
					await this.promptGenerativeAi<ZGeneratedResume>(prompt);

				logToFile({ type: "info", resume: `AI router service generated output: ${JSON.stringify(generatedResume)}` });

				const transformedResume = transformGeneratedResume(
					baseResume,
					generatedResume,
				);

				const zodParsedResume = generatedResumeSchema.parse(transformedResume);

				logger.info(`AI router service zod parsed output: ${JSON.stringify(zodParsedResume)}`);

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
	You are a professional resume generator. Given a master resume and a job description, return a tailored, ATS-friendly resume as a valid JSON object. 

	Constraints:
	- Do NOT change company names, job titles, schools, or dates.
	- Keep descriptions as valid JSON (TipTap format).
	- Return ONLY JSON, no extra text.
	- Each section must exist. If information is missing, fill it with empty strings or default TipTap JSON.
	- For experience, education, award, project sections, the description field should be TipTap JSON format containing a list of bulletList points. These bullet points may be removed, re-ordered, re-phrased or re-organized to tailor to the job description but do not make up facts.
	- For all sections that have array fields, the array may be empty or contain one or more items. These items may be removed, re-ordered, re-phrased or re-organized to tailor to the job description but do not make up facts. Order list items by chronological order.
	- The response will be parsed with a JSON.parse() Javascript function and anything other than a json value will get rejected. 

	Input:
	- Job Description: ${jobDescription}
	- Master Resume: 
		\`\`\`json
		${JSON.stringify(resume, null, 2)}
		\`\`\`

	Output example (strict JSON):

	{
	"summary": "string",
	"experiences": [{"title":"string","company":"string","employmentType":"FULL_TIME","location":"string","locationType":"ON_SITE","startDate":"YYYY-MM-DD","endDate":null,"description":"TipTap JSON string"}],
	"educations": [{"school":"string","degree":"string","fieldOfStudy":"string","startDate":"YYYY-MM-DD","endDate":null,"gpa":0,"gpaMax":null,"location":null,"description":"TipTap JSON string"}],
	"skills": [{"name":"string"}],
	"projects": [{"title":"string","startDate":"YYYY-MM-DD","endDate":null,"description":"TipTap JSON string"}],
	"awards": [{"title":"string","issuer":"string","date":"YYYY-MM-DD","description":"TipTap JSON string"}],
	"certifications": [{"name":"string","issuer":"string","issueDate":"YYYY-MM-DD","expiryDate":null,"credentialId":null,"credentialUrl":null}]
	}

	where TipTap JSON string is a valid TipTap JSON object containing a list of bulletList points, such as:
	{
	"description": {
		"type": "doc",
		"content": [
			{
				"type": "bulletList",
				"content": [
					{
						"type": "listItem",
						"content": [
							{
								"type": "paragraph",
								"content": [
									{
										"text": "Architected an inventory management system for a nonprofit organisation specialising in food donations.",
										"type": "text"
									}
								]
							}
						]
					},
					{
						"type": "listItem",
						"content": [
							{
								"type": "paragraph",
								"content": [
									{
										"text": "Developed useful functions for public, staff and manager with loosely coupled microservices architecture.",
										"type": "text"
									}
								]
							}
						]
					}
				]
			}
		]
	}
}
		`;

	}

	private async promptGenerativeAi<T>(prompt: string): Promise<T> {
		console.log("promptGenerativeAi() gemini prompt: ", prompt);

		try {
			const response = await this.genAI.models.generateContent({
				model: "gemini-2.0-flash",
				contents: prompt,
				config: {
					temperature: 0.2,
					topP: 0.8,
					topK: 40,
					maxOutputTokens: 10000,
					responseMimeType: "application/json",
					// responseSchema,
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
			// Step 1: Extract JSON from code block if present
			const jsonMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
			const jsonString = jsonMatch ? jsonMatch[1].trim() : text;

			// Step 2: Unescape any escaped quotes / newlines
			const cleaned = this.cleanGeminiJsonString(jsonString);

			// Step 3: Parse JSON
			const parsedData = JSON.parse(cleaned);

			// Step 4: Validate with Zod schema
			const validatedData = generatedResumeSchema.parse(parsedData);

			logger.info(
				`parseGeminiContentResponseAsJson() parsed and validated: ${JSON.stringify(validatedData)}`,
			);

			return validatedData as T;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error("Failed to parse AI response message:", errorMessage);
			logger.error(`Failed to parse AI response:${JSON.stringify(response.text)}`);
			throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
		}
	}

	private cleanGeminiJsonString(geminiString: string): string {
		// Remove escaped quotes and unnecessary newlines
		let s = geminiString.trim();
		if (s.startsWith('"') && s.endsWith('"')) {
			s = s.slice(1, -1); // Remove wrapping quotes
		}
		s = s.replace(/\\"/g, '"') // Convert \" -> "
			.replace(/\\n/g, '')  // Remove newlines
			.replace(/\\t/g, '')  // Remove tabs
			.replace(/\\\\/g, '\\'); // Convert double backslashes to single
		return s;
	}
}
