import { z } from 'zod';

export const generateResumeInputSchema = z.object({
  jobApplicationId: z.string().min(1, 'Job application ID is required'),
  customInstructions: z.string().optional(),
});

export const generateCoverLetterInputSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(1, 'Job description is required'),
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  customInstructions: z.string().optional(),
});

export const aiGeneratedContentSchema = z.object({
  status: z.string(),
});

export type ZGenerateResumeInput = z.infer<typeof generateResumeInputSchema>;
export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterInputSchema>;
export type AIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;
