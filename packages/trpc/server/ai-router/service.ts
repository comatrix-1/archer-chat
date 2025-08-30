import type { GenerateResumeInput, GenerateCoverLetterInput } from "./schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient, type Prisma } from "@prisma/client";
import type { ZResumeWithRelations } from "server/resume-router/schema";

const prisma = new PrismaClient();

export class AIService {
	private genAI: GoogleGenerativeAI;

	constructor(apiKey: string) {
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async generateResume(
		userId: string,
		input: GenerateResumeInput
	): Promise<ZResumeWithRelations> {
		try {
			const baseResume = await this.getBaseResume(userId);
			return await this.generateResumeContent(baseResume, input);
		} catch (error) {
			console.error("Error generating resume:", error);
			throw error;
		}
	}

	// TODO: implement
	// async generateCoverLetterForResume(
	// 	userId: string,
	// 	input: GenerateCoverLetterInput & { jobTitle?: string }
	// ): Promise<string> {
	// 	try {
	// 		const baseResume = await this.getBaseResume(userId);
	// 		const coverLetter = await this.generateCoverLetter({
	// 			resume: baseResume,
	// 			jobDescription: input.jobDescription,
	// 			companyName: input.jobTitle?.split(" at ")[1] || "",
	// 			jobTitle: input.jobTitle?.split(" at ")[0] || "",
	// 			customInstructions: input.customInstructions,
	// 		});
	// 		return coverLetter.content;
	// 	} catch (error) {
	// 		console.error("Error generating cover letter:", error);
	// 		throw error;
	// 	}
	// }

	private async getBaseResume(userId: string) {
		const resume = await prisma.resume.findFirst({
			where: {
				userId,
				isMaster: true,
			},
			include: {
				experiences: true,
				educations: true,
				skills: true,
				awards: true,
				certifications: true,
				projects: true,
				contact: true,
			},
		});

		if (!resume) {
			throw new Error("Base resume not found");
		}

		return resume;
	}

	private async generateResumeContent(
		baseResume: Awaited<ReturnType<AIService["getBaseResume"]>>,
		input: GenerateResumeInput,
	): Promise<ZResumeWithRelations> {
		const prompt = this.createResumePrompt({
			jobDescription: input.jobDescription,
			resume: baseResume,
			customInstructions: input.customInstructions,
		});

		const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
		const result = await model.generateContent(prompt);
		const response = await result.response;

		console.log('generateResumeContenxt() response: ', response);

		return JSON.parse(response.text());
	}

	private createResumePrompt(input: {
		jobDescription: string;
		resume: unknown;
		customInstructions?: string;
	}): string {
		return `You are an expert resume writer. Customize this resume for the given job description.
      
      JOB DESCRIPTION:
      ${input.jobDescription}
      
      ${input.customInstructions ? `CUSTOM INSTRUCTIONS:\n${input.customInstructions}\n\n` : ""}
      RESUME DATA (in JSON format):
      ${JSON.stringify(input.resume, null, 2)}
      
      Return a well-formatted resume in JSON format with this structure:
      {
        "summary": "string",
        "experiences": [{"title": "string", "company": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "description": "string"}],
        "educations": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"}],
        "skills": [{"name": "string", "category": "TECHNICAL|SOFT|LANGUAGE", "proficiency": "BEGINNER|INTERMEDIATE|ADVANCED|EXPERT"}],
        "awards": [{"title": "string", "date": "YYYY-MM-DD", "awarder": "string", "summary": "string"}],
        "certifications": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM-DD", "expiryDate": "YYYY-MM-DD"}],
        "projects": [{"name": "string", "description": "string", "technologies": ["string"], "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"}]
      }`;
	}

	// TODO: implement
	// async generateCoverLetter(
	// 	input: GenerateCoverLetterInput,
	// ): Promise<{ content: string }> {
	// 	const prompt = this.createCoverLetterPrompt(input);
	// 	const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
	// 	const result = await model.generateContent(prompt);
	// 	const response = await result.response;

	// 	return { content: response.text() };
	// }

	// private createCoverLetterPrompt(input: GenerateCoverLetterInput): string {
	// 	return `Write a professional cover letter for the following position:
      
    //   POSITION: ${input.jobTitle} at ${input.companyName}
      
    //   JOB DESCRIPTION:
    //   ${input.jobDescription}
      
    //   ${input.customInstructions ? `CUSTOM INSTRUCTIONS:\n${input.customInstructions}\n\n` : ""}
    //   CANDIDATE'S RESUME (in JSON format):
    //   ${JSON.stringify(input.resume, null, 2)}
      
    //   Write a compelling cover letter that highlights the candidate's most relevant experiences and skills.`;
	// }
}
