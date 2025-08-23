import { z } from "zod";

export const JobApplicationStatus = {
	OPEN: "OPEN",
	APPLIED: "APPLIED",
	SCREENING: "SCREENING",
	INTERVIEW: "INTERVIEW",
	OFFER: "OFFER",
	CLOSED: "CLOSED",
	ACCEPTED: "ACCEPTED",
} as const;

export type JobApplicationStatus =
	(typeof JobApplicationStatus)[keyof typeof JobApplicationStatus];

const JobApplicationSchema = z.object({
	id: z.string().cuid().optional(),
	companyName: z.string().min(1, "Company name is required"),
	jobTitle: z.string().min(1, "Job title is required"),
	status: z.nativeEnum(JobApplicationStatus),
	jobLink: z.string().nullable().optional(),
	resumePath: z.string().nullable().optional(),
	coverLetterPath: z.string().nullable().optional(),
	salary: z.string().nullable().optional(),
	remarks: z.string().nullable().optional(),
	userId: z.string().uuid(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const jobApplicationIdSchema = z.object({
	id: z.string().cuid("Invalid CUID format"),
});

export const jobApplicationListSchema = z.object({
	userId: z.string().uuid("Invalid user ID format"),
	status: z.nativeEnum(JobApplicationStatus).optional(),
	limit: z.number().int().positive().max(100).default(20).optional(),
	cursor: z.string().cuid().optional(),
});

export const createJobApplicationSchema = JobApplicationSchema.pick({
	companyName: true,
	jobTitle: true,
	status: true,
	jobLink: true,
	resumePath: true,
	coverLetterPath: true,
	salary: true,
	remarks: true,
	userId: true,
});

export const updateJobApplicationSchema = JobApplicationSchema.pick({
	id: true,
	companyName: true,
	jobTitle: true,
	status: true,
	jobLink: true,
	resumePath: true,
	coverLetterPath: true,
	salary: true,
	remarks: true,
});

export const jobApplicationWithRelationsSchema = JobApplicationSchema;

export type ZJobApplicationInput = z.infer<typeof JobApplicationSchema>;
export type ZCreateJobApplicationInput = z.infer<
	typeof createJobApplicationSchema
>;
export type ZUpdateJobApplicationInput = z.infer<
	typeof updateJobApplicationSchema
>;
export type ZJobApplicationListInput = z.infer<typeof jobApplicationListSchema>;
export type ZJobApplicationWithRelations = z.infer<typeof JobApplicationSchema>;
