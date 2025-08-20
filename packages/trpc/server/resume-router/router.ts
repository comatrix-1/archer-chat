import { router, protectedProcedure } from '../trpc';
import { resumeService } from './service';
import { 
  resumeIdSchema, 
  resumeListSchema, 
  createResumeSchema, 
  updateResumeSchema
} from './schema';

export const resumeRouter = router({
  // Create a new resume
  create: protectedProcedure
    .input(createResumeSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }
      return resumeService.createResume(input);
    }),

  // Get a single resume by ID
  getById: protectedProcedure
    .input(resumeIdSchema)
    .query(async ({ input, ctx }) => {
      return resumeService.getResume(input.id, ctx.user.id);
    }),

  // Update a resume
  update: protectedProcedure
    .input(updateResumeSchema)
    .mutation(async ({ input, ctx }) => {
      return resumeService.updateResume(input, ctx.user.id);
    }),

  // Delete a resume
  delete: protectedProcedure
    .input(resumeIdSchema)
    .mutation(async ({ input, ctx }) => {
      return resumeService.deleteResume(input.id, ctx.user.id);
    }),

  // List all resumes for the current user
  list: protectedProcedure
    .input(resumeListSchema.optional())
    .query(async ({ input, ctx }) => {
      const userId = input?.userId || ctx.user.id;
      
      // Ensure users can only list their own resumes
      if (userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      return resumeService.listResumes(
        userId,
        input?.limit,
        input?.cursor
      );
    }),
});