import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { prisma } from '@project/prisma';
import type { 
  ZCreateResumeInput,
  ZUpdateResumeInput,
  ResumeWithRelations
} from './schema';
import { includeAllRelations } from './schema';

export const resumeService = {
  /**
   * Create a new resume
   */
  async createResume(input: ZCreateResumeInput): Promise<ResumeWithRelations> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create contact if provided, otherwise create an empty one
        const contact = await tx.contact.create({
          data: input.contact || {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            linkedin: '',
            github: '',
            portfolio: '',
          },
        });

        // Create the resume
        const resume = await tx.resume.create({
          data: {
            title: input.title,
            summary: input.summary ?? undefined,
            userId: input.userId,
            contactId: contact.id,
          },
          include: includeAllRelations,
        });

        // Helper function to create related items
        const createRelatedItems = async <T extends { id?: string; resumeId?: string }>(
          items: T[] | undefined,
          createFn: (data: any) => Promise<any>,
          transformFn: (item: T, resumeId: string) => any
        ) => {
          if (!items?.length) return [];
          return Promise.all(
            items.map(item => 
              createFn(transformFn(item, resume.id))
            )
          );
        };

        // Create all related items
        await Promise.all([
          createRelatedItems(
            input.awards,
            (data) => tx.award.create({ data }),
            (item) => ({ ...item, resumeId: resume.id })
          ),
          createRelatedItems(
            input.certifications,
            (data) => tx.certification.create({ data }),
            (item) => ({ ...item, resumeId: resume.id })
          ),
          createRelatedItems(
            input.educations,
            (data) => tx.education.create({ data }),
            (item) => ({ ...item, resumeId: resume.id })
          ),
          createRelatedItems(
            input.experiences,
            (data) => tx.experience.create({ data }),
            (item) => ({ ...item, resumeId: resume.id })
          ),
          createRelatedItems(
            input.projects,
            (data) => tx.project.create({ data }),
            (item) => ({
              ...item,
              resumeId: resume.id,
            })
          ),
          createRelatedItems(
            input.skills,
            (data) => tx.skill.create({ data }),
            (item) => ({
              ...item,
              resumeId: resume.id,
            })
          ),
        ]);

        // Return the full resume with all relations
        return tx.resume.findUniqueOrThrow({
          where: { id: resume.id },
          include: includeAllRelations,
        }) as unknown as ResumeWithRelations;
      });
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create resume',
      });
    }
  },

  /**
   * Get a resume by ID with all relations
   */
  async getResume(id: string, userId: string): Promise<ResumeWithRelations> {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: includeAllRelations,
    }) as Prisma.ResumeGetPayload<{ include: typeof includeAllRelations }> | null;

    if (!resume) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Resume not found',
      });
    }

    return resume as unknown as ResumeWithRelations;
  },

  /**
   * Update a resume
   */
  async updateResume(input: ZUpdateResumeInput, userId: string): Promise<ResumeWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // First, verify the resume exists and belongs to the user
      const existingResume = await tx.resume.findUnique({
        where: { id: input.id },
      });

      if (!existingResume || existingResume.userId !== userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found',
        });
      }

      // Update the resume
      const updateData: Prisma.ResumeUpdateInput = {
        title: input.title,
        summary: input.summary ?? undefined,
      };

      // Update contact if provided
      if (input.contact) {
        await tx.contact.update({
          where: { id: existingResume.contactId },
          data: input.contact,
        });
      }

      // Update the resume
      await tx.resume.update({
        where: { id: input.id },
        data: updateData,
      });

      // Helper function to update related items
      const updateRelatedItems = async <T extends { id?: string; resumeId?: string }>(
        items: T[] | undefined,
        existingItems: any[],
        createFn: (data: any) => Promise<any>,
        updateFn: (id: string, data: any) => Promise<any>,
        deleteFn: (id: string) => Promise<any>,
        transformFn: (item: T, resumeId: string) => any
      ) => {
        if (!items && !existingItems?.length) return [];
        
        const inputItems = items || [];
        const existingIds = new Set(existingItems.map(i => i.id));
        const inputIds = new Set(inputItems.filter(i => i.id).map(i => i.id));
        
        // Delete removed items
        const itemsToDelete = existingItems.filter(i => !inputIds.has(i.id));
        await Promise.all(itemsToDelete.map(item => deleteFn(item.id)));
        
        // Update or create items
        return Promise.all(
          inputItems.map(item => {
            const data = transformFn(item, existingResume.id);
            return item.id && existingIds.has(item.id)
              ? updateFn(item.id, data)
              : createFn(data);
          })
        );
      };

      // Get existing related items
      const existing = await tx.resume.findUnique({
        where: { id: input.id },
        include: {
          awards: true,
          certifications: true,
          educations: true,
          experiences: true,
          projects: true,
          skills: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch existing resume data',
        });
      }

      // Update all related items
      await Promise.all([
        updateRelatedItems(
          input.awards,
          existing.awards,
          (data) => tx.award.create({ data }),
          (id, data) => tx.award.update({ where: { id }, data }),
          (id) => tx.award.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
        updateRelatedItems(
          input.certifications,
          existing.certifications,
          (data) => tx.certification.create({ data }),
          (id, data) => tx.certification.update({ where: { id }, data }),
          (id) => tx.certification.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
        updateRelatedItems(
          input.educations,
          existing.educations,
          (data) => tx.education.create({ data }),
          (id, data) => tx.education.update({ where: { id }, data }),
          (id) => tx.education.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
        updateRelatedItems(
          input.experiences,
          existing.experiences,
          (data) => tx.experience.create({ data }),
          (id, data) => tx.experience.update({ where: { id }, data }),
          (id) => tx.experience.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
        updateRelatedItems(
          input.projects,
          existing.projects,
          (data) => tx.project.create({ data }),
          (id, data) => tx.project.update({ where: { id }, data }),
          (id) => tx.project.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
        updateRelatedItems(
          input.skills,
          existing.skills,
          (data) => tx.skill.create({ data }),
          (id, data) => tx.skill.update({ where: { id }, data }),
          (id) => tx.skill.delete({ where: { id } }),
          (item) => ({
            ...item,
            resumeId: existingResume.id,
          })
        ),
      ]);

      // Return the full updated resume with all relations
      const updatedResume = await tx.resume.findUniqueOrThrow({
        where: { id: input.id },
        include: includeAllRelations,
      });

      return updatedResume as unknown as ResumeWithRelations;
    });
  },

  /**
   * Delete a resume
   */
  async deleteResume(id: string, userId: string): Promise<{ success: boolean }> {
    try {
      // First, verify the resume exists and belongs to the user
      const resume = await prisma.resume.findUnique({
        where: { id },
      });

      if (!resume || resume.userId !== userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found',
        });
      }

      // Delete all related records and the resume in a transaction
      await prisma.$transaction([
        prisma.award.deleteMany({ where: { resumeId: id } }),
        prisma.certification.deleteMany({ where: { resumeId: id } }),
        prisma.education.deleteMany({ where: { resumeId: id } }),
        prisma.experience.deleteMany({ where: { resumeId: id } }),
        prisma.project.deleteMany({ where: { resumeId: id } }),
        prisma.skill.deleteMany({ where: { resumeId: id } }),
        // Delete the resume
        prisma.resume.delete({ where: { id } }),
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete resume',
      });
    }
  },

  /**
   * Get the master resume for a user
   */
  async getMasterResume(userId: string): Promise<ResumeWithRelations> {
    const resume = await prisma.resume.findFirst({
      where: { 
        userId,
        isMaster: true 
      },
      include: includeAllRelations,
    }) as Prisma.ResumeGetPayload<{ include: typeof includeAllRelations }> | null;

    if (!resume) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Master resume not found',
      });
    }

    return resume as unknown as ResumeWithRelations;
  },

  /**
   * List resumes for a user
   */
  async listResumes(
    userId: string,
    limit = 20,
    cursor?: string
  ): Promise<{ items: ResumeWithRelations[]; nextCursor?: string }> {
    const items = (await prisma.resume.findMany({
      where: { userId },
      take: limit + 1, // Get one extra to determine next cursor
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'desc' }, // Using id for consistent ordering
      include: includeAllRelations,
    })) as unknown as ResumeWithRelations[];

    let nextCursor: string | undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  },
};
