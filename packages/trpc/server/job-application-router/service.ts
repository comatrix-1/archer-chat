import { TRPCError } from "@trpc/server";
import { prisma } from "@project/prisma";
import type {
	ZCreateJobApplicationServiceInput,
	ZUpdateJobApplicationInput,
	ZJobApplicationWithRelations,
	JobApplicationStatus,
} from "./schema";

// Helper to remove undefined values for Prisma
type PrismaInput<T> = {
	[K in keyof T]: T[K] extends object
		? PrismaInput<T[K]>
		: Exclude<T[K], undefined>;
};

export const jobApplicationService = {
	/**
	 * Create a new job application
	 */
	async createJobApplication(
		input: ZCreateJobApplicationServiceInput,
	): Promise<ZJobApplicationWithRelations> {
		try {
			return await prisma.jobApplication.create({
				data: input,
			});
		} catch (error) {
			console.error("Error creating job application:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create job application",
			});
		}
	},

	/**
	 * Get a job application by ID
	 */
	async getJobApplication(
		id: string,
		userId: string,
	): Promise<ZJobApplicationWithRelations> {
		const jobApplication = await prisma.jobApplication.findUnique({
			where: { id },
		});

		if (!jobApplication) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Job application not found",
			});
		}

		if (jobApplication.userId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have permission to view this job application",
			});
		}

		return jobApplication;
	},

	/**
	 * Update a job application
	 */
	async updateJobApplication(
		input: ZUpdateJobApplicationInput,
		userId: string,
	): Promise<ZJobApplicationWithRelations> {
		// First verify the job application exists and belongs to the user
		const existing = await prisma.jobApplication.findUnique({
			where: { id: input.id },
		});

		if (!existing || existing.userId !== userId) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Job application not found",
			});
		}

		// Remove undefined values for Prisma
		const { id, ...updateData } = input;

		return prisma.jobApplication.update({
			where: { id },
			data: updateData
		});
	},

	/**
	 * Delete a job application
	 */
	async deleteJobApplication(
		id: string,
		userId: string,
	): Promise<{ success: boolean }> {
		// First verify the job application exists and belongs to the user
		const existing = await prisma.jobApplication.findUnique({
			where: { id },
		});

		if (!existing || existing.userId !== userId) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Job application not found",
			});
		}

		try {
			await prisma.jobApplication.delete({
				where: { id },
			});
			return { success: true };
		} catch (error) {
			console.error("Error deleting job application:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete job application",
			});
		}
	},

	/**
	 * List job applications for a user
	 */
	async listJobApplications(
		userId: string,
		status?: JobApplicationStatus,
		limit = 20,
		cursor?: string,
	): Promise<{ items: ZJobApplicationWithRelations[]; nextCursor?: string }> {
		const dbItems = await prisma.jobApplication.findMany({
			where: {
				userId,
				...(status && { status }),
			},
			take: limit + 1, // Get one extra to determine next cursor
			cursor: cursor ? { id: cursor } : undefined,
			orderBy: { createdAt: "desc" },
		});

		const items = dbItems.map((item) => ({
			...item,
			jobLink: item.jobLink || undefined,
			salary: item.salary || undefined,
			remarks: item.remarks || undefined,
		}));

		let nextCursor: string | undefined;
		if (dbItems.length > limit) {
			const nextItem = dbItems[limit - 1];
			nextCursor = nextItem?.id;
		}

		return { 
			items: items.slice(0, limit), // Return only the requested number of items
			nextCursor,
		};
	},
};
