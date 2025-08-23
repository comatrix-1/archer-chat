import { router, protectedProcedure } from "../trpc";
import { jobApplicationService } from "./service";
import {
	jobApplicationIdSchema,
	jobApplicationListSchema,
	createJobApplicationSchema,
	updateJobApplicationSchema,
} from "./schema";

export const jobApplicationRouter = router({
	create: protectedProcedure
		.input(createJobApplicationSchema)
		.mutation(async ({ input, ctx }) => {
			if (input.userId !== ctx.user.id) {
				throw new Error("Unauthorized");
			}
			return jobApplicationService.createJobApplication(input);
		}),

	getById: protectedProcedure
		.input(jobApplicationIdSchema)
		.query(async ({ input, ctx }) => {
			return jobApplicationService.getJobApplication(input.id, ctx.user.id);
		}),

	update: protectedProcedure
		.input(updateJobApplicationSchema)
		.mutation(async ({ input, ctx }) => {
			return jobApplicationService.updateJobApplication(input, ctx.user.id);
		}),

	delete: protectedProcedure
		.input(jobApplicationIdSchema)
		.mutation(async ({ input, ctx }) => {
			return jobApplicationService.deleteJobApplication(input.id, ctx.user.id);
		}),

	list: protectedProcedure
		.input(jobApplicationListSchema.optional())
		.query(async ({ input, ctx }) => {
			const userId = input?.userId || ctx.user.id;

			if (userId !== ctx.user.id) {
				throw new Error("Unauthorized");
			}

			return jobApplicationService.listJobApplications(
				userId,
				input?.status,
				input?.limit,
				input?.cursor,
			);
		}),
});
