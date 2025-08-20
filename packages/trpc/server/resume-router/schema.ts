import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ZEmploymentType = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'SELF_EMPLOYED',
  'FREELANCE',
  'CONTRACT',
  'INTERNSHIP',
  'APPRENTICESHIP',
  'SEASONAL'
]);

export const ZLocationType = z.enum([
  'ON_SITE',
  'HYBRID',
  'REMOTE'
]);

export type ZEmploymentType = z.infer<typeof ZEmploymentType>;
export type ZLocationType = z.infer<typeof ZLocationType>;

// Define the base resume schema
const ResumeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  contactId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Input schemas
export const resumeIdSchema = z.object({
  id: z.string().uuid('Invalid UUID format')
});

export const resumeListSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  limit: z.number().int().positive().max(100).default(20).optional(),
  cursor: z.string().uuid().optional(),
});

// Export types
export type ResumeInput = z.infer<typeof ResumeSchema>;
export type ResumeIdInput = z.infer<typeof resumeIdSchema>;
export type ResumeListInput = z.infer<typeof resumeListSchema>;

// Base schemas for related models
const ZAwardSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  issuer: z.string(),
  date: z.date().nullable().optional(),
  description: z.string().optional(),
  resumeId: z.string().uuid().optional(),
});

export const ZCertificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.date(),
  expiryDate: z.date().nullable().optional(),
  credentialId: z.string().nullable().optional(),
  resumeId: z.string().uuid().optional(),
});

export const ZEducationSchema = z.object({
  id: z.string().uuid().optional(),
  school: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  gpa: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  resumeId: z.string().uuid().optional(),
});

const ZExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  employmentType: ZEmploymentType,
  company: z.string(),
  location: z.string(),
  locationType: ZLocationType,
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string().nullable().optional(),
  resumeId: z.string().uuid().optional(),
});

const ZProjectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string().nullable().optional(),
  resumeId: z.string().uuid().optional(),
});

const ZSkillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  proficiency: z.string(),
  category: z.string().optional(),
  resumeId: z.string().uuid().optional(),
});

export const createResumeSchema = ResumeSchema.pick({
  title: true,
  summary: true,
  userId: true,
}).extend({
  awards: z.array(ZAwardSchema).optional(),
  certifications: z.array(ZCertificationSchema).optional(),
  educations: z.array(ZEducationSchema).optional(),
  experiences: z.array(ZExperienceSchema).optional(),
  projects: z.array(ZProjectSchema).optional(),
  skills: z.array(ZSkillSchema).optional(),
  contact: z.any().optional(),
});

export const updateResumeSchema = ResumeSchema.pick({
  id: true,
  title: true,
  summary: true,
}).extend({
  title: z.string().min(1, 'Title is required').optional(),
  summary: z.string().nullable().optional(),
  awards: z.array(ZAwardSchema).optional(),
  certifications: z.array(ZCertificationSchema).optional(),
  educations: z.array(ZEducationSchema).optional(),
  experiences: z.array(ZExperienceSchema).optional(),
  projects: z.array(ZProjectSchema).optional(),
  skills: z.array(ZSkillSchema).optional(),
  contact: z.any().optional(),
});

// Output schema with relations
export const resumeWithRelationsSchema = ResumeSchema.extend({
  awards: z.array(ZAwardSchema).optional(),
  certifications: z.array(ZCertificationSchema).optional(),
  contact: z.any().optional(), // Assuming ContactSchema is not defined here, keep as any for now

  educations: z.array(ZEducationSchema).optional(),
  experiences: z.array(ZExperienceSchema).optional(),
  projects: z.array(ZProjectSchema).optional(),
  skills: z.array(ZSkillSchema).optional()
});

// Define the include relations for Prisma queries
export const includeAllRelations = {
  awards: true,
  certifications: true,
  contact: true,
  educations: true,
  experiences: true,
  projects: true,
  skills: true,
} as const;

// Define types based on Prisma's generated types
export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: typeof includeAllRelations;
}>;

export type ZCreateResumeInput = z.infer<typeof createResumeSchema>;
export type ZUpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type ZResumeWithRelations = z.infer<typeof resumeWithRelationsSchema>;


