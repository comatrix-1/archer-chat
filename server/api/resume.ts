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

    console.log('title:', title);
    console.log('jobDescription:', jobDescription);
    console.log('profile:', profile);

    // Use Gemini LLM to generate resume and cover letter
    let resume = '', coverLetter = '';
    try {
      const result = await generateResumeWithGemini({ title, jobDescription, profile });
      resume = result.resume;
      coverLetter = result.coverLetter;
    } catch (error) {
      console.error('Gemini LLM generation error:', error);
      resume = 'Error generating resume.';
      coverLetter = 'Error generating cover letter.';
    }

    return c.json({
      resume,
      coverLetter,
    });
  });

export default resumeRoute;
