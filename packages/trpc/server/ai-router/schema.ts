import {
	ZExperienceSchema,
	ZEducationSchema,
	ZSkillSchema,
	ZProjectSchema,
	ZAwardSchema,
	ZCertificationSchema,
  ZSafeExperienceSchema,
  ZSafeAwardSchema,
  ZSafeCertificationSchema,
  ZSafeEducationSchema,
  ZSafeProjectSchema,
  ZSafeSkillSchema,
} from "server/resume-router/schema";
import { z } from "zod";

export const generateResumeInputSchema = z.object({
	jobApplicationId: z.string().min(1, "Job application ID is required"),
	customInstructions: z.string().optional(),
});

export const generatedResumeSchema = z.object({
	summary: z.string(),
	experiences: z.array(ZSafeExperienceSchema),
	educations: z.array(ZSafeEducationSchema),
	skills: z.array(ZSafeSkillSchema),
	projects: z.array(ZSafeProjectSchema),
	awards: z.array(ZSafeAwardSchema),
	certifications: z.array(ZSafeCertificationSchema),
});

export const generateCoverLetterInputSchema = z.object({
	resumeId: z.string(),
	jobDescription: z.string().min(1, "Job description is required"),
	companyName: z.string().min(1, "Company name is required"),
	jobTitle: z.string().min(1, "Job title is required"),
	customInstructions: z.string().optional(),
});

export const aiGeneratedContentSchema = z.object({
	status: z.string(),
});

export type ZGenerateResumeInput = z.infer<typeof generateResumeInputSchema>;
export type ZGenerateCoverLetterInput = z.infer<
	typeof generateCoverLetterInputSchema
>;
export type ZAIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;
export type ZGeneratedResume = z.infer<typeof generatedResumeSchema>;
