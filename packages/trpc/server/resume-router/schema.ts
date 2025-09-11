import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const ZEmploymentType = z.enum([
	"FULL_TIME",
	"PART_TIME",
	"SELF_EMPLOYED",
	"FREELANCE",
	"CONTRACT",
	"INTERNSHIP",
	"APPRENTICESHIP",
	"SEASONAL",
]);

export const ZLocationType = z.enum(["ON_SITE", "HYBRID", "REMOTE"]);

export type ZEmploymentType = z.infer<typeof ZEmploymentType>;
export type ZLocationType = z.infer<typeof ZLocationType>;

// Helper to accept string or Date and transform to Date
const ZDate = z
	.union([z.string(), z.date()])
	.transform((val) => (val ? new Date(val) : null));
const ZNullableDate = z
	.union([z.string(), z.date(), z.null()])
	.transform((val) => (val ? new Date(val) : null));

// Define the base resume schema
export const ResumeSchema = z.object({
	id: z.string().cuid(),
	isMaster: z.boolean().default(false),
	userId: z.string().uuid().optional(),
	title: z.string(),
	summary: z.string().nullable().optional(),
	contactId: z.string().cuid().optional(),
	createdAt: ZDate.optional(),
	updatedAt: ZDate.optional(),
});

// Input schemas
export const resumeIdSchema = z.object({
	id: z.string().cuid("Invalid CUID format"),
});

export const resumeListSchema = z.object({
	userId: z.string().uuid("Invalid user ID format"),
	limit: z.number().int().positive().max(100).default(20).optional(),
	cursor: z.string().cuid().optional(),
});

// Export types
export type ResumeInput = z.infer<typeof ResumeSchema>;
export type ResumeIdInput = z.infer<typeof resumeIdSchema>;
export type ResumeListInput = z.infer<typeof resumeListSchema>;

// Base schemas for related models
export const ZAwardSchema = z.object({
	id: z.string().cuid().optional(),
	title: z.string(),
	issuer: z.string(),
	date: ZNullableDate.optional(),
	description: z.string().optional(),
	resumeId: z.string().cuid().optional(),
});

export const ZCertificationSchema = z.object({
	id: z.string().cuid().optional(),
	name: z.string(),
	issuer: z.string(),
	issueDate: ZNullableDate.optional(),
	expiryDate: ZNullableDate.optional(),
	credentialId: z.string().nullable().optional(),
	credentialUrl: z.string().nullable().optional(),
	resumeId: z.string().cuid().optional(),
});

export const ZEducationSchema = z.object({
	id: z.string().cuid().optional(),
	school: z.string(),
	degree: z.string(),
	fieldOfStudy: z.string(),
	startDate: ZNullableDate.optional(),
	endDate: ZNullableDate.optional(),
	gpa: z.number().nullable().optional(),
	gpaMax: z.number().nullable().optional(),
	location: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	resumeId: z.string().cuid().optional(),
});

export const ZExperienceSchema = z.object({
	id: z.string().cuid().optional(),
	title: z.string(),
	employmentType: ZEmploymentType,
	company: z.string(),
	location: z.string(),
	locationType: ZLocationType,
	startDate: ZNullableDate.optional(),
	endDate: ZNullableDate.optional(),
	description: z.string().nullable().optional(),
	resumeId: z.string().cuid().optional(),
});

export const ZProjectSchema = z.object({
	id: z.string().cuid().optional(),
	title: z.string(),
	startDate: ZNullableDate.optional(),
	endDate: ZNullableDate.optional(),
	description: z.string().nullable().optional(),
	resumeId: z.string().cuid().optional(),
});

export const ZSkillSchema = z.object({
	id: z.string().cuid().optional(),
	name: z.string(),
	resumeId: z.string().cuid().optional(),
});

export const ZContactSchema = z.object({
	id: z.string().cuid(),
	fullName: z.string().nullable().default(""),
	email: z.string().email().or(z.literal("")).nullable().default(""),
	phone: z.string().nullable().default(""),
	address: z.string().nullable().default(""),
	city: z.string().nullable().default(""),
	country: z.string().nullable().default(""),
	linkedin: z.string().nullable().default(""),
	github: z.string().nullable().default(""),
	portfolio: z.string().nullable().default(""),
});

export const ZSafeContactSchema = ZContactSchema.omit({ id: true });
export const ZSafeAwardSchema = ZAwardSchema.omit({ id: true, resumeId: true });
export const ZSafeCertificationSchema = ZCertificationSchema.omit({
	id: true,
	resumeId: true,
});
export const ZSafeEducationSchema = ZEducationSchema.omit({
	id: true,
	resumeId: true,
});
export const ZSafeExperienceSchema = ZExperienceSchema.omit({
	id: true,
	resumeId: true,
});
export const ZSafeProjectSchema = ZProjectSchema.omit({
	id: true,
	resumeId: true,
});
export const ZSafeSkillSchema = ZSkillSchema.omit({ id: true, resumeId: true });

export const createResumeSchema = ResumeSchema.pick({
	isMaster: true,
	summary: true,
}).extend({
	userId: z.string().uuid(),
	title: z.string().optional(),
	awards: z.array(ZSafeAwardSchema),
	certifications: z.array(ZSafeCertificationSchema),
	educations: z.array(ZSafeEducationSchema),
	experiences: z.array(ZSafeExperienceSchema),
	projects: z.array(ZSafeProjectSchema),
	skills: z.array(ZSafeSkillSchema),
	contact: ZSafeContactSchema,
});

export const updateResumeSchema = ResumeSchema.pick({
	id: true,
	title: true,
	summary: true,
}).extend({
	title: z.string().min(1, "Title is required").optional(),
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
	contact: z.any().optional(),
	educations: z.array(ZEducationSchema).optional(),
	experiences: z.array(ZExperienceSchema).optional(),
	projects: z.array(ZProjectSchema).optional(),
	skills: z.array(ZSkillSchema).optional(),
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

export const ZSafeResumeWithRelationsSchema = ResumeSchema.omit({
	id: true,
	contactId: true,
}).extend({
	contact: ZSafeContactSchema,
	awards: z.array(ZSafeAwardSchema),
	certifications: z.array(ZSafeCertificationSchema),
	educations: z.array(ZSafeEducationSchema),
	experiences: z.array(ZSafeExperienceSchema),
	projects: z.array(ZSafeProjectSchema),
	skills: z.array(ZSafeSkillSchema),
});

// Schema for updating master resume (same as updateResumeSchema but without id)
export const updateMasterResumeSchema = ResumeSchema.pick({
	title: true,
	summary: true,
}).extend({
	userId: z.string().uuid(),
	awards: z.array(ZAwardSchema).optional(),
	certifications: z.array(ZCertificationSchema).optional(),
	educations: z.array(ZEducationSchema).optional(),
	experiences: z.array(ZExperienceSchema).optional(),
	projects: z.array(ZProjectSchema).optional(),
	skills: z.array(ZSkillSchema).optional(),
	contact: z.any().optional(),
});

export type ZCreateResumeInput = z.infer<typeof createResumeSchema>;
export type ZUpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type ZUpdateMasterResumeInput = z.infer<typeof updateMasterResumeSchema>;
export type ZResumeWithRelations = z.infer<typeof resumeWithRelationsSchema>;
export type ZSafeResumeWithRelations = z.infer<
	typeof ZSafeResumeWithRelationsSchema
>;
