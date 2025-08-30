import { router, protectedProcedure } from "../trpc";
import { AIService } from "./service";
import {
	generateResumeInputSchema,
	aiGeneratedContentSchema,
} from "./schema";

const aiService = new AIService(process.env.GOOGLE_API_KEY || "");

export const aiRouter = router({
	generateResume: protectedProcedure
		.input(generateResumeInputSchema)
		.output(aiGeneratedContentSchema)
		.mutation(async ({ input, ctx }) => {
			if (input.jobDescription.length === 0) {
				throw new Error("Job description is required");
			}
			const resume = await aiService.generateResume(ctx.user.id, input);
			return {
				content: JSON.stringify(resume, null, 2),
				metadata: { type: "resume" },
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
