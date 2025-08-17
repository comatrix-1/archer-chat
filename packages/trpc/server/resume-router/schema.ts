import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Define the base resume schema
const ResumeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  contactId: z.string().uuid(),
  conversationId: z.string().uuid().nullable(),
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

export const createResumeSchema = ResumeSchema.pick({
  title: true,
  summary: true,
  userId: true,
});

export const updateResumeSchema = ResumeSchema.pick({
  id: true,
  title: true,
  summary: true,
}).extend({
  title: z.string().min(1, 'Title is required').optional(),
  summary: z.string().nullable().optional(),
});

// Output schema with relations
export const resumeWithRelationsSchema = ResumeSchema.extend({
  awards: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  contact: z.any().optional(),
  conversation: z.any().nullable().optional(),
  educations: z.array(z.any()).optional(),
  experiences: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  skills: z.array(z.any()).optional()
});

// Define the include relations for Prisma queries
export const includeAllRelations = {
  awards: true,
  certifications: true,
  contact: true,
  conversation: true,
  educations: true,
  experiences: true,
  projects: true,
  skills: true,
} as const;

// Define types based on Prisma's generated types
export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: typeof includeAllRelations;
}>;

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;