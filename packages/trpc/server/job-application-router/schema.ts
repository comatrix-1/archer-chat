import { z } from "zod";

export const JobApplicationStatus = {
	OPEN: "OPEN",
	APPLIED: "APPLIED",
	SCREENING: "SCREENING",
	INTERVIEW: "INTERVIEW",
	OFFER: "OFFER",
	CLOSED: "CLOSED",
	ACCEPTED: "ACCEPTED",
	REJECTED: "REJECTED",
} as const;

export type JobApplicationStatus =
	(typeof JobApplicationStatus)[keyof typeof JobApplicationStatus];

const JobApplicationSchema = z.object({
	id: z.string().cuid().optional(),
	companyName: z.string().min(1, "Company name is required"),
	jobTitle: z.string().min(1, "Job title is required"),
	status: z.nativeEnum(JobApplicationStatus),
	jobLink: z.string().nullable().optional(),
	resumeId: z.string().cuid().nullable().optional(),
	coverLetterId: z.string().cuid().nullable().optional(),
	salary: z.string().nullable().optional(),
	jobDescription: z.string().nullable().optional(),
	remarks: z.string().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const jobApplicationIdSchema = z.object({
	id: z.string().cuid("Invalid CUID format"),
});

export const jobApplicationListSchema = z.object({
	status: z.nativeEnum(JobApplicationStatus).optional(),
	limit: z.number().int().positive().max(100).default(20).optional(),
	cursor: z.string().cuid().optional(),
});

export const jobApplicationWithIdSchema = JobApplicationSchema.pick({
	companyName: true,
	jobTitle: true,
	status: true,
	jobLink: true,
	resumeId: true,
	coverLetterId: true,
	salary: true,
	remarks: true,
}).extend({
	id: z.string().cuid("Invalid CUID format"),
});

export const createJobApplicationSchema = JobApplicationSchema.pick({
	companyName: true,
	jobTitle: true,
	status: true,
	jobLink: true,
	jobDescription: true,
	resumeId: true,
	coverLetterId: true,
	salary: true,
	remarks: true,
});

export const updateJobApplicationSchema = JobApplicationSchema.pick({
	id: true,
	companyName: true,
	jobTitle: true,
	status: true,
	jobLink: true,
	jobDescription: true,
	resumeId: true,
	coverLetterId: true,
	salary: true,
	remarks: true,
});

export const jobApplicationListResponseSchema = z.object({
	items: z.array(jobApplicationWithIdSchema),
	nextCursor: z.string().optional(),
});

export const jobApplicationWithRelationsSchema = JobApplicationSchema;

export type ZJobApplicationInput = z.infer<typeof JobApplicationSchema>;
// Input type for the API (without userId)
export type ZCreateJobApplicationInput = z.infer<
	typeof createJobApplicationSchema
>;
export type ZJobApplicationWithId = z.infer<typeof jobApplicationWithIdSchema>;

// Internal type for the service (includes userId)
export type ZCreateJobApplicationServiceInput = ZCreateJobApplicationInput & {
	userId: string;
};
export type ZUpdateJobApplicationInput = z.infer<
	typeof updateJobApplicationSchema
>;
export type ZJobApplicationListInput = z.infer<typeof jobApplicationListSchema>;
export type ZJobApplicationWithRelations = z.infer<typeof JobApplicationSchema>;
export type ZJobApplicationListResponse = z.infer<
	typeof jobApplicationListResponseSchema
>;
