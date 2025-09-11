import { router, protectedProcedure } from "../trpc";
import { AIService } from "./service";
import { generateResumeInputSchema, aiGeneratedContentSchema } from "./schema";
import { resumeService } from "server/resume-router/service";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { format } from "date-fns";

const aiService = new AIService(process.env.GOOGLE_API_KEY || "");

export const aiRouter = router({
	generateResume: protectedProcedure
		.input(generateResumeInputSchema)
		.output(aiGeneratedContentSchema)
		.mutation(async ({ input, ctx }) => {
			if (input.jobApplicationId.length === 0) {
				throw new Error("Job application ID is required");
			}

			const resume = await aiService.generateResume(ctx.user.id, input);
			const masterResume = await resumeService.getMasterResume(ctx.user.id);

			const fullResume = {
				...resume,
				contact: masterResume.contact,
				isMaster: false,
				userId: ctx.user.id,
			};

			await resumeService.createResume(fullResume);
			return {
				status: "success",
			};
		}),

	// TODO: implement
	// generateCoverLetter: protectedProcedure
	// 	.input(generateCoverLetterInputSchema)
	// 	.output(aiGeneratedContentSchema)
	// 	.mutation(async ({ input, ctx }) => {
	// 		const resume = await resumeService.getResume(input.resumeId, ctx.user.id);
	// 		if (resume.userId !== ctx.user.id) {
	// 			throw new Error("Unauthorized");
	// 		}
	// 		const content = await aiService.generateCoverLetterForResume(
	// 			ctx.user.id,
	// 			input,
	// 		);
	// 		return {
	// 			content,
	// 			metadata: { type: "cover_letter" },
	// 		};
	// 	}),
});

export const logToFile = async ({ type, resume }: { type: string; resume: any }) => {
	try {
		const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
		const logDir = join(process.cwd(), "logs");
		const logFile = join(logDir, `resume_${timestamp}_${type}.json`);

		await mkdir(logDir, { recursive: true });
		await writeFile(
			logFile,
			JSON.stringify(
				{
					type,
					timestamp: new Date().toISOString(),
					resume,
				},
				null,
				2,
			),
		);
		console.log(`Full resume logged to: ${logFile}`);
	} catch (error) {
		console.error("Failed to write resume log file:", error);
	}
};
