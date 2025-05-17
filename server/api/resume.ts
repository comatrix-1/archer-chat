import { Hono } from "hono";
import type { Context } from "hono";
import { jwt as honoJwt } from "hono/jwt";
import prisma from "~/utils/prisma";
import { generateResumeWithGemini } from "../utils/generateResumeWithGemini.js";
import type {
  Experience,
  Education,
  Skill,
  HonorsAwards,
  LicenseCertification,
  Project,
  Resume,
} from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

export const resumeRoute = new Hono()
  .use(honoJwt({ secret: JWT_SECRET }))
  .get("/", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;

    const resume = await prisma.resume.findUnique({
      where: {
        userId_conversationId: {
          // Keep conversationId for the base resume template
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
        projects: true, // Include projects
      },
    });
    if (resume) {
      return c.json({ resume });
    } else {
      console.log("Base resume template not found, creating new one");
    }

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

    const newResume = await prisma.resume.create({
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
        projects: true, // Include projects
      },
    });

    console.log("Returning new base resume template", newResume);
    return c.json({ resume: newResume });
  })
  .post("/", async (c: Context) => {
    // Extract JWT from Authorization header
    const authHeader = c.req.header("Authorization");
    let userId;
    let resume;
    let updatedResume;
    try {
      const body = await c.req.json();
      // Support both { resume: {...} } and direct resume object in request
      resume = body.resume ?? (body as Resume);
      console.log("POST /api/resume :: authHeader:", authHeader);
      console.log("POST /api/resume :: resume payload:", resume);
      const payload = c.get("jwtPayload") as { userId: string };
      userId = payload.userId;
      console.log("POST /api/resume :: userId:", userId);

      try {
        const resumeData = resume;

        // try { // Removed inner try for Prisma transaction
        const updatedResume = await prisma.$transaction(async (prisma) => {
          const { id, ...contactData } = resumeData.contact;
          await prisma.contact.update({
            where: { id },
            data: {
              ...contactData,
            },
          });

          // Update experience records
          await prisma.experience.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.experiences?.length) {
            await prisma.experience.createMany({
              data: resumeData.experiences.map((exp: Experience) => ({
                ...exp,
                resumeId: resumeData.id,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
              })),
            });
          }

          // Update education records
          await prisma.education.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.educations?.length) {
            await prisma.education.createMany({
              data: resumeData.educations.map((edu: Education) => ({
                ...edu,
                resumeId: resumeData.id,
                startDate: new Date(edu.startDate),
                endDate: edu.endDate ? new Date(edu.endDate) : null,
              })),
            });
          }

          // Update skills
          await prisma.skill.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.skills?.length) {
            await prisma.skill.createMany({
              data: resumeData.skills.map((skill: Skill) => ({
                ...skill,
                resumeId: resumeData.id,
              })),
            });
          }

          // Update honors and awards
          await prisma.honorsAwards.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.honorsAwards?.length) {
            await prisma.honorsAwards.createMany({
              data: resumeData.honorsAwards.map((award: HonorsAwards) => ({
                ...award,
                resumeId: resumeData.id,
                date: new Date(award.date),
              })),
            });
          }

          // Update projects
          await prisma.project.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.projects?.length) {
            await prisma.project.createMany({
              data: resumeData.projects.map((proj: Project) => ({
                ...proj,
                resumeId: resumeData.id,
                startDate: new Date(proj.startDate),
                endDate: proj.endDate ? new Date(proj.endDate) : null,
              })),
            });
          }
          // Update license certifications
          await prisma.licenseCertification.deleteMany({
            where: { resumeId: resumeData.id },
          });
          if (resumeData.licenseCertifications?.length) {
            await prisma.licenseCertification.createMany({
              data: resumeData.licenseCertifications.map(
                (cert: LicenseCertification) => ({
                  ...cert,
                  resumeId: resumeData.id,
                  issueDate: new Date(cert.issueDate),
                  expiryDate: cert.expiryDate
                    ? new Date(cert.expiryDate)
                    : null,
                })
              ),
            });
          }

          return prisma.resume.update({
            where: {
              userId_conversationId: {
                userId: resumeData.userId,
                conversationId: resumeData.conversationId,
              },
            },
            data: {
              objective: resumeData.objective,
            },
            include: {
              contact: true,
              experiences: true,
              educations: true,
              skills: true,
              honorsAwards: true,
              licenseCertifications: true,
              projects: true, // Include projects
            },
          });
        });

        console.log("Resume updated successfully");
        return c.json({
          success: true,
          message: "Resume updated successfully",
          resume: updatedResume,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error updating resume:", error); // More generic error log
          return c.json({
            success: false,
            message: "Failed to update resume", // More generic message
            error: error.message || "An unknown error occurred",
          });
        } else {
          console.error("An unknown error occurred.");
        }
      }
      // TODO: remove
      // updatedResume = await prisma.resume.upsert({
      //   where: {
      //     userId_conversationId: {
      //       userId,
      //       conversationId: ""
      //     }
      //   },
      //   update: profile,
      //   create: { // This create block needs adjustment for related models if upsert is used
      //     ...resume,
      //     userId,
      //     conversationId: ""
      //   }
      // });
      // console.log("POST /api/resume :: updatedResume:", updatedResume); // This log might not be reached on success now
    } catch (error) {
      console.error("POST /api/resume :: error:", error);
      return c.json(
        {
          error: "Failed to update resume",
          details: error,
          debug: { authHeader, resume, userId },
        },
        500
      );
    }
  })
  .put("/", async (c) => {
    const { email, name, role, contactId } = await c.req.json();
    if (!email || !contactId)
      return c.json({ error: "Email and contactId are required" }, 400);
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    // Update user name and role
    await prisma.user.update({
      where: { id: user.id },
      data: { name, role },
    });
    // Update base resume template using composite key
    const updated = await prisma.resume.update({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId: "",
        },
      },
      data: { contactId },
    });
    return c.json(updated);
  })
  .post("/generate", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
    const { title, jobDescription } = await c.req.json();

    // Fetch user's base resume template
    const baseResumeTemplate = await prisma.resume.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: "",
        },
      },
      include: {
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
        projects: true, // Include projects
      },
    });
    console.log("Base resume template:", baseResumeTemplate);
    if (!baseResumeTemplate) {
      return c.json({ error: "Resume not found" }, 404);
    }
    const existingContact = await prisma.contact.findUnique({
      where: { id: baseResumeTemplate.contactId },
    });
    if (!existingContact) {
      return c.json({ error: "Contact not found" }, 404);
    }

    // Use Gemini LLM to generate resume and cover letter
    let generatedResume = "",
      coverLetter = "";
    let savedResume = null;
    try {
      const result = await generateResumeWithGemini({
        title,
        jobDescription,
        resume: baseResumeTemplate, // Pass the template to Gemini
      });
      generatedResume = result.resume;
      coverLetter = result.coverLetter;

      // Only save if resume is an object with expected fields
      if (
        generatedResume &&
        typeof generatedResume === "object" &&
        (generatedResume as any).objective &&
        Array.isArray((generatedResume as any).experiences) &&
        Array.isArray((generatedResume as any).educations) &&
        Array.isArray((generatedResume as any).skills) &&
        Array.isArray((generatedResume as any).honorsAwards) &&
        Array.isArray((generatedResume as any).projects) &&
        Array.isArray((generatedResume as any).licenseCertifications)
        // Add check for projects if Gemini might generate them
      ) {
        const r = generatedResume as any;

        // Sanitize date fields to ensure valid ISO-8601 strings or null
        function sanitizeDates(obj: any) {
          if (!obj || typeof obj !== "object") return obj;
          // Add all possible date field names you expect from Gemini
          const dateFields = [
            "startDate",
            "endDate",
            "issueDate",
            "expirationDate",
            "expiryDate",
            "date",
          ];
          for (const key in obj) {
            if (dateFields.includes(key)) {
              let val = obj[key];
              if (
                !val ||
                typeof val !== "string" ||
                val.trim() === "" ||
                isNaN(Date.parse(val))
              ) {
                obj[key] = null;
              } else {
                // If string is YYYY-MM-DD, convert to full ISO string
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                  obj[key] = new Date(val + "T00:00:00.000Z").toISOString();
                } else {
                  obj[key] = new Date(val).toISOString();
                }
              }
            } else if (Array.isArray(obj[key])) {
              obj[key] = obj[key].map(sanitizeDates);
            } else if (typeof obj[key] === "object") {
              obj[key] = sanitizeDates(obj[key]);
            }
          }
          return obj;
        }

        // Create a new Contact record by copying the existing one
        const { id: oldContactId, ...contactDataToCopy } = existingContact; // Exclude the old ID
        const newContact = await prisma.contact.create({
          data: {
            ...contactDataToCopy,
            // Ensure default values are handled if any fields were null in the original
            // (though your schema has defaults, this is safer)
            email: contactDataToCopy.email ?? "",
            phone: contactDataToCopy.phone ?? "",
          },
        });
        // Sanitize all nested date fields
        r.experiences = r.experiences.map(sanitizeDates);
        r.educations = r.educations.map(sanitizeDates);
        r.honorsAwards = r.honorsAwards.map(sanitizeDates);
        r.licenseCertifications = r.licenseCertifications.map(sanitizeDates);
        // Sanitize projects if Gemini generates them

        const createdConversation = await prisma.conversation.create({
          data: {
            userId,
            title,
            status: "PENDING",
          },
        });

        savedResume = await prisma.resume.create({
          data: {
            // Nested writes for related models
            userId,
            conversationId: createdConversation.id,
            objective: r.objective || "",
            contactId: newContact.id, // Use the ID of the newly created contact
            experiences: {
              // Remove resumeId from nested create data
              create: r.experiences.map(({ id, resumeId, ...exp }: Experience) => exp), // Also remove id
            },
            educations: {
              // Remove resumeId from nested create data
              create: r.educations.map(({ id, resumeId, ...edu }: Education) => edu), // Also remove id
            },
            skills: {
              // Remove resumeId from nested create data
              create: r.skills.map(({ id, resumeId, ...skill }: Skill) => skill), // Also remove id
            },
            honorsAwards: {
              // Remove resumeId from nested create data
              create: r.honorsAwards.map(({ id, resumeId, ...award }: HonorsAwards) => award), // Also remove id
            },
            licenseCertifications: {
              // Remove resumeId from nested create data
              create: r.licenseCertifications.map(({ id, resumeId, ...cert }: LicenseCertification) => cert), // Also remove id
            },
            projects: {
              // Remove resumeId from nested create data
              create: (r.projects || []).map(({ id, resumeId, ...proj }: Project) => proj), // Also remove id
            },
          },
          include: {
            contact: true,
            experiences: true,
            educations: true,
            skills: true,
            honorsAwards: true,
            licenseCertifications: true,
            projects: true,
            conversation: true,
          },
        });
        await prisma.conversation.update({
          where: { id: createdConversation.id },
          data: { resumeId: savedResume.id },
        });
      }
    } catch (error) {
      console.error("Gemini LLM generation error:", error);
      generatedResume = "Error generating resume.";
      coverLetter = "Error generating cover letter.";
    }

    return c.json({
      resume: generatedResume,
      coverLetter,
    });
  })

  // List all generated resumes (Profiles) for the user
  .get("/list", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
    // Fetch generated resumes (excluding the base template) and include their conversations
    const resumes = await prisma.resume.findMany({
      where: {
        userId,
        conversationId: {
          not: null,
          notIn: [""],
        },
      },
      orderBy: { id: "desc" },
      include: {
        contact: true,
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
        projects: true, // Include projects
        conversation: true,
      },
    });
    return c.json({ resumes });
  })

  // Get a single generated resume by ID
  .get("/:id", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
    const id = c.req.param("id");
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        contact: true,
        experiences: true,
        educations: true,
        skills: true,
        honorsAwards: true,
        licenseCertifications: true,
        projects: true, // Include projects
        conversation: true,
      },
    });
    if (!resume || resume.userId !== userId) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json({ resume });
  })

  // Delete a generated resume by ID
  .delete("/:id", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
    const id = c.req.param("id");

    try {
      // First check if the resume exists and belongs to the user
      const resume = await prisma.resume.findUnique({
        where: { id },
        include: { conversation: true },
      });

      console.log("resume:", resume);

      if (!resume || resume.userId !== userId) {
        return c.json({ error: "Not found" }, 404);
      }

      // Delete the resume. Prisma will handle cascading deletes for related
      // records (Experience, Education, Contact, Conversation, etc.)
      // based on the onDelete rules defined in your schema.prisma.
      await prisma.$transaction(async (tx) => {
        // Only delete the resume; cascades handle the rest.
        console.log(`Attempting to delete resume with ID: ${id}`);
        await tx.resume.delete({ where: { id } });
      });

      return c.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      return c.json({ error: "Failed to delete resume" }, 500);
    }
  });

export default resumeRoute;
