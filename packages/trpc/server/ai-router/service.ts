import type { ZGenerateResumeInput, GenerateCoverLetterInput } from "./schema";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient, type Prisma } from "@prisma/client";
import { jobApplicationService } from "server/job-application-router/service";
import type { ZResumeWithRelations } from "server/resume-router/schema";

const prisma = new PrismaClient();

export class AIService {
	private readonly genAI: GoogleGenAI;

	constructor(apiKey: string) {
		this.genAI = new GoogleGenAI({ apiKey });
	}

	async generateResume(
		userId: string,
		input: ZGenerateResumeInput,
	): Promise<ZResumeWithRelations> {
		try {
			const baseResume = await this.getBaseResume(userId);
			return await this.generateResumeContent(userId, baseResume, input);
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
		userId: string,
		baseResume: Awaited<ReturnType<AIService["getBaseResume"]>>,
		input: ZGenerateResumeInput,
	): Promise<ZResumeWithRelations> {
		const MAX_RETRIES = 2;
		let attempt = 0;
		let lastError: Error | null = null;

		const jobDescription = await jobApplicationService.getJobApplication(
			input.jobApplicationId,
			userId,
		);

		while (attempt < MAX_RETRIES) {
			try {
				console.log(
					`Calling Gemini API (Attempt ${attempt + 1}/${MAX_RETRIES})`,
				);
				const ai = this.genAI;

				const prompt = this.createResumePrompt({
					jobDescription: JSON.stringify(jobDescription),
					resume: baseResume,
					customInstructions: input.customInstructions,
				});

				console.log(
					"generateResumeContent() - Input prompt to generative AI:",
					prompt,
				);

				const response = await ai.models.generateContent({
					model: "gemini-2.5-flash",
					contents: prompt,
				});
				console.log(
					"generateResumeContent() - Received response:",
					response.text,
				);
				const text = response.text || "";

				let jsonString = text.trim();
				const codeBlockMatch = jsonString.match(
					/^```(?:json)?\s*([\s\S]*?)\s*```$/i,
				);
				if (codeBlockMatch) {
					jsonString = codeBlockMatch[1].trim();
				}

				const result = JSON.parse(jsonString) as ZResumeWithRelations;

				console.log("generateResumeContent() - Successfully parsed response");
				return result;
			} catch (e: unknown) {
				console.error(`Attempt ${attempt + 1} failed:`, (e as Error).message);
				lastError = new Error(
					`Failed to parse AI response as JSON: ${(e as Error).message}`,
				);
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

	private createResumePrompt(input: {
		jobDescription: string;
		resume: unknown;
		customInstructions?: string;
	}): string {
		const schemaStructure = `
      RESUME SCHEMA STRUCTURE (Prisma format):
      model Resume {
        id             String         @id @default(cuid())
        title          String         @default("Resume")
        summary        String         @default("")
        isMaster       Boolean        @default(false)
        
        experiences    Experience[]
        educations     Education[]
        skills         Skill[]
        awards         Award[]
        certifications Certification[]
        projects       Project[]
        contact        Contact
      }

      model Experience {
        id          String   @id @default(cuid())
        title       String
        company     String
        startDate   DateTime
        endDate     DateTime?
        description String
      }

      model Education {
        id          String   @id @default(cuid())
        institution String
        degree      String
        fieldOfStudy String
        startDate   DateTime
        endDate     DateTime?
      }

      model Skill {
        id         String   @id @default(cuid())
        name       String
        category   String   // TECHNICAL, SOFT, or LANGUAGE
        proficiency String?  // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
      }

      model Award {
        id      String   @id @default(cuid())
        title   String
        date    DateTime
        awarder String
        summary String
      }

      model Certification {
        id         String   @id @default(cuid())
        name       String
        issuer     String
        issueDate  DateTime
        expiryDate DateTime?
      }

      model Project {
        id          String   @id @default(cuid())
        name        String
        description String
        technologies String[]
        startDate   DateTime
        endDate     DateTime?
      }

      model Contact {
        id        String   @id @default(cuid())
        email     String
        phone     String?
        location  String?
        website   String?
        linkedIn  String?
        github    String?
      }
      `;

		return `You are an expert resume writer. Customize this resume for the given job description.
      
      JOB DESCRIPTION:
      ${input.jobDescription}
      
      ${input.customInstructions ? `CUSTOM INSTRUCTIONS:\n${input.customInstructions}\n\n` : ""}
      
      ${schemaStructure}
      
      RESUME DATA (in JSON format):
      ${JSON.stringify(input.resume, null, 2)}
      
      Return a well-formatted resume in JSON format that matches the schema structure above.`;
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
