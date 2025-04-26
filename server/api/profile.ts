import type { Education, Experience, HonorsAwards, LicenseCertification, Skill } from '@prisma/client';
import { Hono, type Context } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import { jwt as honoJwt } from 'hono/jwt';
import prisma from '~/utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Extend context type to include Variables
interface ProfileContext extends Context {
  get<T extends keyof { userId: string }>(key: T): { userId: string }[T];
}

export const profileRoute = new Hono<{ Variables: JwtVariables }>()
  .use(honoJwt({ secret: JWT_SECRET }))
  .get(async (c) => {
    const payload = c.get('jwtPayload') as { userId: string };
    const userId = payload.userId;

    const profile = await prisma.profile.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: "",
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
    if (profile) {
      return c.json({ profile })
    }
    else { console.log('Profile not found, creating new profile'); }

    const contact = await prisma.contact.create({
      data: {
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
        city: "",
        country: "",
      },
    });

    const newProfile = await prisma.profile.create({
      data: {
        userId,
        conversationId: "",
        objective: "",
        contactId: contact.id,
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

    console.log("Returning new profile", newProfile);
    return c.json({ profile: newProfile });
  })
  // POST /api/profile
  .post(async (c) => {
    // Extract JWT from Authorization header
    const authHeader = c.req.header('Authorization');
    let userId;
    let profile;
    let updatedProfile;
    try {
      const body = await c.req.json();
      // Support both { profile: {...} } and direct profile object in request
      profile = body.profile ?? body;
      console.log('POST /api/profile :: authHeader:', authHeader);
      console.log('POST /api/profile :: profile payload:', profile);
      const payload = c.get('jwtPayload') as { userId: string };
      userId = payload.userId;
      console.log('POST /api/profile :: userId:', userId);

      try {
        const profileData = profile;

        try {
          const updatedProfile = await prisma.$transaction(async (prisma) => {

            const { id, ...contactData } = profileData.contact;

            await prisma.contact.update({
              where: { id },
              data: {
                ...contactData,
              },
            });

            // Update experience records
            await prisma.experience.deleteMany({
              where: { profileId: profileData.id },
            });
            if (profileData.experiences?.length) {
              await prisma.experience.createMany({
                data: profileData.experiences.map((exp: Experience) => ({
                  ...exp,
                  profileId: profileData.id,
                  startDate: new Date(exp.startDate),
                  endDate: exp.endDate ? new Date(exp.endDate) : null,
                })),
              });
            }

            // Update education records
            await prisma.education.deleteMany({
              where: { profileId: profileData.id },
            });
            if (profileData.educations?.length) {
              await prisma.education.createMany({
                data: profileData.educations.map((edu: Education) => ({
                  ...edu,
                  profileId: profileData.id,
                  startDate: new Date(edu.startDate),
                  endDate: edu.endDate ? new Date(edu.endDate) : null,
                })),
              });
            }

            // Update skills
            await prisma.skill.deleteMany({
              where: { profileId: profileData.id },
            });
            if (profileData.skills?.length) {
              await prisma.skill.createMany({
                data: profileData.skills.map((skill: Skill) => ({
                  ...skill,
                  profileId: profileData.id,
                })),
              });
            }

            // Update honors and awards
            await prisma.honorsAwards.deleteMany({
              where: { profileId: profileData.id },
            });
            if (profileData.honorsAwards?.length) {
              await prisma.honorsAwards.createMany({
                data: profileData.honorsAwards.map((award: HonorsAwards) => ({
                  ...award,
                  profileId: profileData.id,
                  date: new Date(award.date),
                })),
              });
            }

            // Update license certifications
            await prisma.licenseCertification.deleteMany({
              where: { profileId: profileData.id },
            });
            if (profileData.licenseCertifications?.length) {
              await prisma.licenseCertification.createMany({
                data: profileData.licenseCertifications.map((cert: LicenseCertification) => ({
                  ...cert,
                  profileId: profileData.id,
                  issueDate: new Date(cert.issueDate),
                  expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                })),
              });
            }

            return prisma.profile.update({
              where: {
                userId_conversationId: {
                  userId: profileData.userId,
                  conversationId: profileData.conversationId,
                }
              },
              data: {
                objective: profileData.objective,
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
          });

          console.log("Profile updated successfully");
          return c.json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedProfile,
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Prisma Transaction Error:", error); // Log the error
            return c.json({
              success: false,
              message: "Failed to update profile",
              error: error.message || "Unknown database error", // Provide more specific error info
            });
          } else {
            console.error("An unknown error occurred.");
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("JSON Parsing Error:", error);
          return c.json({
            success: false,
            message: "Invalid profile data",
            error: error.message || "Unknown JSON parsing error",
          });
        } else {
          console.error("An unknown error occurred.");
        }
      }
      // TODO: remove
      // updatedProfile = await prisma.profile.upsert({
      //   where: {
      //     userId_conversationId: {
      //       userId,
      //       conversationId: ""
      //     }
      //   },
      //   update: profile,
      //   create: {
      //     ...profile,
      //     userId,
      //     conversationId: ""
      //   }
      // });
      console.log('POST /api/profile :: updatedProfile:', updatedProfile);
    } catch (error) {
      console.error('POST /api/profile :: error:', error);
      return c.json({ error: "Failed to update profile", details: error, debug: { authHeader, profile, userId } }, 500);
    }

    return c.json({ success: true, profile: updatedProfile });
  })
  // PUT /api/profile
  .put(async (c) => {
    const { email, name, role, contactId } = await c.req.json();
    if (!email || !contactId) return c.json({ error: 'Email and contactId are required' }, 400);
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    // Update user name and role
    await prisma.user.update({
      where: { id: user.id },
      data: { name, role }
    });
    // Update profile using composite key
    const updated = await prisma.profile.update({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId: ""
        }
      },
      data: { contactId }
    });
    return c.json(updated);
  });