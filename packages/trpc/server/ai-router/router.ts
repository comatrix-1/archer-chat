import { router, protectedProcedure } from "../trpc";
import { AIService } from "./service";
import {
	generateResumeInputSchema,
	aiGeneratedContentSchema,
} from "./schema";
import { resumeService } from "server/resume-router/service";

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

			await resumeService.createResume({ ...resume, userId: ctx.user.id });
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
