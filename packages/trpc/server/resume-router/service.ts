import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "@project/prisma";
import type {
	ZCreateResumeInput,
	ZUpdateResumeInput,
	ResumeWithRelations,
	ZSafeResumeWithRelations,
} from "./schema";
import { includeAllRelations, ZSafeResumeWithRelationsSchema } from "./schema";
import { logToFile } from "server/ai-router/router";
import { logger } from "@project/logging/src";

// Helper function to handle creation of related entities
const createRelatedEntities = async <T>(
	tx: Prisma.TransactionClient,
	resumeId: string,
	entities: T[] | undefined,
	entityName: keyof Prisma.ResumeUpdateInput,
	transformFn: (item: T, resumeId: string) => any,
) => {
	if (!entities?.length) return;

	const modelMap: Record<string, string> = {
		awards: "award",
		certifications: "certification",
		educations: "education",
		experiences: "experience",
		projects: "project",
		skills: "skill",
	};

	const prismaModelName = modelMap[entityName as string] || entityName;
	const model = tx[prismaModelName as keyof typeof tx] as any;

	if (!model || typeof model.create !== "function") {
		console.error(
			`Invalid model or create method not found for: ${entityName} (mapped to: ${prismaModelName})`,
		);
		return;
	}

	await Promise.all(
		entities.map((item) => {
			const data = {
				...transformFn(item, resumeId),
				id: crypto.randomUUID(),
				resumeId,
			};
			return model.create({ data });
		}),
	);
};

// Map entity names to their corresponding Prisma model names
const getPrismaModelName = (entityName: string): string => {
	const modelMap: Record<string, string> = {
		awards: "award",
		certifications: "certification",
		educations: "education",
		experiences: "experience",
		projects: "project",
		skills: "skill",
	};
	return modelMap[entityName] || entityName;
};

// Helper function to handle updating of related entities
const updateRelatedEntities = async <T extends { id?: string }>(
	tx: Prisma.TransactionClient,
	resumeId: string,
	inputEntities: T[] | undefined,
	existingEntities: any[],
	entityName: keyof Prisma.ResumeUpdateInput,
	transformFn: (item: T, resumeId: string) => any,
) => {
	if (!inputEntities && !existingEntities?.length) return;

	const prismaModelName = getPrismaModelName(entityName as string);
	const model = tx[prismaModelName as keyof typeof tx] as any;

	if (!model) {
		console.error(
			`Model not found for: ${entityName} (mapped to: ${prismaModelName})`,
		);
		return;
	}

	const inputItems = inputEntities || [];

	// Identify items to delete (exist in DB but not in input)
	const inputIds = new Set(
		inputItems.filter((item) => item.id).map((item) => item.id),
	);
	const itemsToDelete = existingEntities.filter(
		(item) => !inputItems.some((i) => i.id === item.id),
	);

	if (itemsToDelete.length > 0) {
		if (typeof model.delete === "function") {
			await Promise.all(
				itemsToDelete.map((item) => model.delete({ where: { id: item.id } })),
			);
		} else {
			console.error(
				`Delete method not available for model: ${prismaModelName}`,
			);
		}
	}

	// Create or update items
	await Promise.all(
		inputItems.map((item) => {
			const data = transformFn(item, resumeId);
			if (item.id) {
				return model.update({ where: { id: item.id }, data });
			}
			// Create new item if it doesn't have an ID
			return model.create({
				data: {
					...data,
					id: crypto.randomUUID(),
					resumeId,
				},
			});
		}),
	);
};

// Transform functions for each entity type
const transformAward = (item: any, resumeId: string) => ({ ...item });
const transformCertification = (item: any, resumeId: string) => ({ ...item });
const transformEducation = (item: any, resumeId: string) => ({ ...item });
const transformExperience = (item: any, resumeId: string) => ({ ...item });
const transformProject = (item: any, resumeId: string) => ({ ...item });
const transformSkill = (item: any, resumeId: string) => ({ ...item });

export const resumeService = {
	/**
	 * Create a new resume
	 */
	async createResume(input: ZCreateResumeInput): Promise<ResumeWithRelations> {
		try {
			logToFile({ type: "create", resume: input });
			return await prisma.$transaction(async (tx) => {
				const resume = await tx.resume.create({
					data: {
						title: input.title || "Untitled Resume",
						summary: input.summary || "",
						userId: input.userId,
						isMaster: input.isMaster || false,
					},
				});

				if (input.contact) {
					await tx.contact.create({
						data: { ...input.contact, resumeId: resume.id },
					});
				}

				await Promise.all([
					createRelatedEntities(
						tx,
						resume.id,
						input.awards,
						"awards",
						transformAward,
					),
					createRelatedEntities(
						tx,
						resume.id,
						input.certifications,
						"certifications",
						transformCertification,
					),
					createRelatedEntities(
						tx,
						resume.id,
						input.educations,
						"educations",
						transformEducation,
					),
					createRelatedEntities(
						tx,
						resume.id,
						input.experiences,
						"experiences",
						transformExperience,
					),
					createRelatedEntities(
						tx,
						resume.id,
						input.projects,
						"projects",
						transformProject,
					),
					createRelatedEntities(
						tx,
						resume.id,
						input.skills,
						"skills",
						transformSkill,
					),
				]);

				// Fetch the complete resume with all relations
				const completeResume = await tx.resume.findUnique({
					where: { id: resume.id },
					include: includeAllRelations,
				});

				if (!completeResume) {
					throw new Error("Failed to fetch created resume");
				}

				return completeResume as unknown as ResumeWithRelations;
			});
		} catch (error) {
			console.error("Error creating resume:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create resume",
			});
		}
	},

	/**
	 * Get a resume by ID with all relations
	 */
	async getResume(
		id: string,
		userId: string,
	): Promise<ZSafeResumeWithRelations> {
		const resume = await prisma.resume.findUnique({
			where: { id, userId },
			include: includeAllRelations,
		});

		if (!resume) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Resume not found" });
		}

		return ZSafeResumeWithRelationsSchema.parse(resume);
	},

	/**
	 * Update a resume
	 */
	async updateResume(
		input: ZUpdateResumeInput,
		userId: string,
	): Promise<ResumeWithRelations> {
		return await prisma.$transaction(async (tx) => {
			logger.info({
				type: "update",
				resume: input,
				userId,
			}, "Updating resume");
			// Verify the resume exists and belongs to the user
			const existingResume = await tx.resume.findUnique({
				where: { id: input.id },
				include: { contact: true },
			});

			if (!existingResume || existingResume.userId !== userId) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Resume not found",
				});
			}

			// Update the resume
			const updatedResume = await tx.resume.update({
				where: { id: input.id },
				data: {
					title: input.title,
					summary: input.summary ?? undefined,
				},
				include: includeAllRelations,
			});

			// Get existing related entities
			const existing = await tx.resume.findUnique({
				where: { id: input.id },
				include: includeAllRelations,
			});

			if (!existing) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch existing resume data",
				});
			}

			// Update contact if provided
			if (input.contact) {
				const contactData = {
					...input.contact,
					resumeId: existingResume.id,
				};

				if (existing.contact) {
					// Update existing contact
					await tx.contact.update({
						where: { id: existing.contact.id },
						data: contactData,
					});
				} else {
					// Create new contact if none exists
					await tx.contact.create({
						data: contactData,
					});
				}
			}

			// Update all related entities
			await Promise.all([
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.awards,
					existing.awards,
					"awards",
					transformAward,
				),
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.certifications,
					existing.certifications,
					"certifications",
					transformCertification,
				),
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.educations,
					existing.educations,
					"educations",
					transformEducation,
				),
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.experiences,
					existing.experiences,
					"experiences",
					transformExperience,
				),
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.projects,
					existing.projects,
					"projects",
					transformProject,
				),
				updateRelatedEntities(
					tx,
					existingResume.id,
					input.skills,
					existing.skills,
					"skills",
					transformSkill,
				),
			]);

			// Return the updated resume with all relations
			return updatedResume as unknown as ResumeWithRelations;
		});
	},

	/**
	 * Delete a resume
	 */
	async deleteResume(
		id: string,
		userId: string,
	): Promise<{ success: boolean }> {
		try {
			return await prisma.$transaction(async (tx) => {
				// First verify the resume exists and belongs to the user
				const resume = await tx.resume.findUnique({
					where: { id, userId },
					include: { contact: true },
				});

				if (!resume) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Resume not found or access denied",
					});
				}

				// Then delete the resume (cascading will handle other related records)
				await tx.resume.delete({
					where: { id },
				});

				return { success: true };
			});
		} catch (error) {
			console.error("Error deleting resume:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete resume",
			});
		}
	},

	async getMasterResume(userId: string): Promise<ZSafeResumeWithRelations> {
		const resume = await prisma.resume.findFirst({
			where: {
				userId,
				isMaster: true,
			},
			include: includeAllRelations,
		});

		if (!resume) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Master resume not found",
			});
		}

		return ZSafeResumeWithRelationsSchema.parse(resume);
	},

	/**
	 * Update the master resume for a user
	 */
	async updateMasterResume(
		input: Omit<ZUpdateResumeInput, "id" | "isMaster"> & { userId: string },
	): Promise<ResumeWithRelations> {
		return prisma.$transaction(async (tx) => {
			// Find the master resume
			const existing = await tx.resume.findFirst({
				where: {
					userId: input.userId,
					isMaster: true,
				},
				include: includeAllRelations,
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Master resume not found",
				});
			}

			// Update contact if provided
			if (input.contact) {
				const contactData = {
					...input.contact,
					resumeId: existing.id,
				};

				if (existing.contact) {
					// Update existing contact
					await tx.contact.update({
						where: { id: existing.contact.id },
						data: contactData,
					});
				} else {
					// Create new contact if none exists
					await tx.contact.create({
						data: contactData,
					});
				}
			}

			// Update the resume
			await tx.resume.update({
				where: { id: existing.id },
				data: {
					title: input.title,
					summary: input.summary ?? undefined,
				},
			});

			// Update related entities
			await Promise.all([
				updateRelatedEntities(
					tx,
					existing.id,
					input.awards,
					existing.awards,
					"awards",
					transformAward,
				),
				updateRelatedEntities(
					tx,
					existing.id,
					input.certifications,
					existing.certifications,
					"certifications",
					transformCertification,
				),
				updateRelatedEntities(
					tx,
					existing.id,
					input.educations,
					existing.educations,
					"educations",
					transformEducation,
				),
				updateRelatedEntities(
					tx,
					existing.id,
					input.experiences,
					existing.experiences,
					"experiences",
					transformExperience,
				),
				updateRelatedEntities(
					tx,
					existing.id,
					input.projects,
					existing.projects,
					"projects",
					transformProject,
				),
				updateRelatedEntities(
					tx,
					existing.id,
					input.skills,
					existing.skills,
					"skills",
					transformSkill,
				),
			]);

			// Return the updated resume with all relations
			return tx.resume.findUniqueOrThrow({
				where: { id: existing.id },
				include: includeAllRelations,
			}) as unknown as ResumeWithRelations;
		});
	},

	/**
	 * List resumes for a user
	 */
	async listResumes(
		userId: string,
		limit = 20,
		cursor?: string,
	): Promise<{ items: ResumeWithRelations[]; nextCursor?: string }> {
		const items = (await prisma.resume.findMany({
			where: { userId },
			take: limit + 1, // Get one extra to determine next cursor
			cursor: cursor ? { id: cursor } : undefined,
			orderBy: { id: "desc" }, // Using id for consistent ordering
			include: includeAllRelations,
		})) as ResumeWithRelations[];

		let nextCursor: string | undefined;
		if (items.length > limit) {
			const nextItem = items.pop();
			nextCursor = nextItem?.id;
		}

		return { items, nextCursor };
	},
};
