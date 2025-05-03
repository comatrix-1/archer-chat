import { Hono } from 'hono';
import type { Context } from 'hono';
import { jwt as honoJwt } from 'hono/jwt';
import prisma from '~/utils/prisma';
import { generateResumeWithGemini } from '../utils/generateResumeWithGemini.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

export const resumeRoute = new Hono()
  .use(honoJwt({ secret: JWT_SECRET }))
  .post('/generate', async (c: Context) => {
    const payload = c.get('jwtPayload') as { userId: string };
    const userId = payload.userId;
    const { title, jobDescription } = await c.req.json();

    // Fetch user profile similar to /api/profile GET
    const profile = await prisma.profile.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: '',
        },
      },
      include: {
        contact: true,
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
      },
    });
    console.log('profile:', profile);

    // Use Gemini LLM to generate resume and cover letter
    let resume = '', coverLetter = '';
    let savedProfile = null;
    try {
      const result = await generateResumeWithGemini({ title, jobDescription, profile });
      resume = result.resume;
      coverLetter = result.coverLetter;

      // Only save if resume is an object with expected fields
      if (
        resume &&
        typeof resume === 'object' &&
        (resume as any).objective &&
        (resume as any).contact &&
        Array.isArray((resume as any).experiences) &&
        Array.isArray((resume as any).educations) &&
        Array.isArray((resume as any).skills) &&
        Array.isArray((resume as any).honorsAwards) &&
        Array.isArray((resume as any).licenseCertifications)
      ) {
        const r = resume as any;

        // Sanitize date fields to ensure valid ISO-8601 strings or null
        function sanitizeDates(obj: any) {
          if (!obj || typeof obj !== 'object') return obj;
          // Add all possible date field names you expect from Gemini
          const dateFields = ['startDate', 'endDate', 'issueDate', 'expirationDate', 'expiryDate', 'date'];
          for (const key in obj) {
            if (dateFields.includes(key)) {
              let val = obj[key];
              if (!val || typeof val !== 'string' || val.trim() === '' || isNaN(Date.parse(val))) {
                obj[key] = null;
              } else {
                // If string is YYYY-MM-DD, convert to full ISO string
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                  obj[key] = new Date(val + 'T00:00:00.000Z').toISOString();
                } else {
                  obj[key] = new Date(val).toISOString();
                }
              }
            } else if (Array.isArray(obj[key])) {
              obj[key] = obj[key].map(sanitizeDates);
            } else if (typeof obj[key] === 'object') {
              obj[key] = sanitizeDates(obj[key]);
            }
          }
          return obj;
        }

        // Sanitize all nested date fields
        r.experiences = r.experiences.map(sanitizeDates);
        r.educations = r.educations.map(sanitizeDates);
        r.honorsAwards = r.honorsAwards.map(sanitizeDates);
        r.licenseCertifications = r.licenseCertifications.map(sanitizeDates);

        // Step 1: Create conversation
        const createdConversation = await prisma.conversation.create({
          data: {
            userId,
            title,
            status: 'PENDING',
          },
        });
        // Step 2: Create contact
        const createdContact = await prisma.contact.create({ data: r.contact });
        // Step 3: Create profile with userId + conversationId composite key
        savedProfile = await prisma.profile.create({
          data: {
            userId,
            conversationId: createdConversation.id,
            objective: r.objective || '',
            contactId: createdContact.id,
            experiences: {
              create: r.experiences,
            },
            educations: {
              create: r.educations,
            },
            skills: {
              create: r.skills,
            },
            honorsAwards: {
              create: r.honorsAwards,
            },
            licenseCertifications: {
              create: r.licenseCertifications,
            },
          },
          include: {
            contact: true,
            experiences: true,
            educations: true,
            skills: true,
            honorsAwards: true,
            licenseCertifications: true,
            Conversation: true,
          },
        });
        // Step 4: Link profileId to conversation
        await prisma.conversation.update({
          where: { id: createdConversation.id },
          data: { profileId: savedProfile.id },
        });
      }
    } catch (error) {
      console.error('Gemini LLM generation error:', error);
      resume = 'Error generating resume.';
      coverLetter = 'Error generating cover letter.';
    }

    return c.json({
      resume,
      coverLetter,
      savedProfile,
    });
  })

  // List all generated resumes (Profiles) for the user
  .get('/list', async (c: Context) => {
    const payload = c.get('jwtPayload') as { userId: string };
    const userId = payload.userId;
    // Fetch profiles and include their conversations
    const profiles = await prisma.profile.findMany({
      where: {
        userId,
        conversationId: {
          not: null,
          notIn: [""]
        },
      },
      orderBy: { id: 'desc' },
      include: {
        contact: true,
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
        Conversation: true,
      },
    });
    return c.json({ profiles });
  })

  // Get a single generated resume/profile by ID
  .get('/:id', async (c: Context) => {
    const payload = c.get('jwtPayload') as { userId: string };
    const userId = payload.userId;
    const id = c.req.param('id');
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        contact: true,
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
        Conversation: true,
      },
    });
    if (!profile || profile.userId !== userId) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json({ profile });
  })

  // Delete a generated resume/profile by ID
  .delete('/:id', async (c: Context) => {
    const payload = c.get('jwtPayload') as { userId: string };
    const userId = payload.userId;
    const id = c.req.param('id');

    try {
      // First check if the profile exists and belongs to the user
      const profile = await prisma.profile.findUnique({
        where: { id },
        include: { Conversation: true },
      });

      console.log('profile:', profile);

      if (!profile || profile.userId !== userId) {
        return c.json({ error: 'Not found' }, 404);
      }

      // Delete the profile. Prisma will handle cascading deletes for related
      // records (Experience, Education, Contact, Conversation, etc.)
      // based on the onDelete rules defined in your schema.prisma.
      await prisma.$transaction(async (tx) => {
        // Only delete the profile; cascades handle the rest.
        console.log(`Attempting to delete profile with ID: ${id}`);
        await tx.profile.delete({ where: { id } });
      });

      return c.json({ message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      return c.json({ error: 'Failed to delete resume' }, 500);
    }
  });

export default resumeRoute;
