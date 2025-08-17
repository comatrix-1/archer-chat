import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { prisma } from '@project/prisma';
import type { 
  CreateResumeInput,
  UpdateResumeInput,
  ResumeWithRelations
} from './schema';
import { includeAllRelations } from './schema';

export const resumeService = {
  /**
   * Create a new resume
   */
  async createResume(input: CreateResumeInput): Promise<ResumeWithRelations> {
    try {
      // First, create a conversation for this resume
      const conversation = await prisma.conversation.create({
        data: {
          title: `Resume: ${input.title}`,
          userId: input.userId,
        },
      });

      // Create a new contact for the resume
      const contact = await prisma.contact.create({
        data: {
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

      // Create the resume with required relations
      const result = await prisma.resume.create({
        data: {
          userId: input.userId, // Directly assign userId
          summary: input.summary ?? undefined, // Use undefined instead of null for optional fields
          contactId: contact.id, // Directly assign contactId
          conversationId: conversation.id, // Directly assign conversationId
        },
        include: includeAllRelations,
      });
      
      return result as unknown as ResumeWithRelations;
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
  async updateResume(input: UpdateResumeInput, userId: string): Promise<ResumeWithRelations> {
    // First, verify the resume exists and belongs to the user
    const existingResume = await prisma.resume.findUnique({
      where: { id: input.id },
    });

    if (!existingResume || existingResume.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Resume not found',
      });
    }

    // Prepare the update data using Prisma's update types
    const updateData: Prisma.ResumeUpdateInput = {};
    
    if ('summary' in input) {
      updateData.summary = input.summary ?? '';
    }
    
    const result = await prisma.resume.update({
      where: { id: input.id },
      data: updateData,
      include: includeAllRelations,
    });

    if (!result) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update resume',
      });
    }

    return result;
  },

  /**
   * Delete a resume
   */
  // async deleteResume(id: string, userId: string): Promise<{ success: boolean }> {
  //   // First verify the resume exists and belongs to the user
  //   const existing = await prisma.resume.findUnique({
  //     where: { id },
  //   });

  //   if (!existing || existing.userId !== userId) {
  //     throw new TRPCError({
  //       code: 'NOT_FOUND',
  //       message: 'Resume not found',
  //     });
  //   }

  //   try {
  //     await prisma.$transaction([
  //       // Delete related records first
  //       prisma.award.deleteMany({ where: { resumeId: id } }),
  //       prisma.certification.deleteMany({ where: { resumeId: id } }),
  //       prisma.education.deleteMany({ where: { resumeId: id } }),
  //       prisma.experience.deleteMany({ where: { resumeId: id } }),
  //       prisma.project.deleteMany({ where: { resumeId: id } }),
  //       prisma.skill.deleteMany({ where: { resumeId: id } }),
  //       // Delete the resume
  //       prisma.resume.delete({ where: { id } }),
  //     ]);

  //     return { success: true };
  //   } catch (error) {
  //     console.error('Error deleting resume:', error);
  //     throw new TRPCError({
  //       code: 'INTERNAL_SERVER_ERROR',
  //       message: 'Failed to delete resume',
  //     });
  //   }
  // },

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
