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
import {
  EmploymentType,
  LocationType,
  SkillCategory,
  SkillProficiency
} from "@prisma/client";
import { userContextMiddleware } from "server/middleware/userContext.js";

// Define a type for the Hono context variables
interface HonoEnv {
  Variables: {
    user: { id: string };
    jwtPayload: { userId: string;[key: string]: any }; // Add other jwtPayload fields if necessary
  };
}
// Helper functions
function isEmptyOrInvalidDate(val: any): boolean {
  return !val ||
    (typeof val === "string" && val.trim() === "") ||
    val.toString().toLowerCase() === "present" ||
    (typeof val === "string" && isNaN(Date.parse(val)));
}

function formatDateString(dateStr: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "T00:00:00.000Z").toISOString();
  }

  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "-01T00:00:00.000Z").toISOString();
  }

  return null;
}

function formatDateValue(val: any): string | null {
  if (isEmptyOrInvalidDate(val)) {
    return null;
  }

  if (typeof val === "string") {
    const formatted = formatDateString(val);
    if (formatted) {
      return formatted;
    }
  }

  try {
    return new Date(val).toISOString();
  } catch (e) {
    console.error(`Failed to parse date value: ${val}`, e); // S2486: Handle exception
    return null;
  }
}

function processObject(obj: any, dateFields: string[]): any {
  if (!obj || typeof obj !== "object") return obj;

  const result = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in result) {
    if (dateFields.includes(key)) {
      result[key] = formatDateValue(result[key]);
    } else if (Array.isArray(result[key])) {
      result[key] = processObject(result[key], dateFields);
    } else if (result[key] && typeof result[key] === "object") {
      result[key] = processObject(result[key], dateFields);
    }
  }

  return result;
}

function sanitizeDates(obj: any) {
  const dateFields = [
    "startDate",
    "endDate",
    "issueDate",
    "expirationDate",
    "expiryDate",
    "date",
  ];
  return processObject(obj, dateFields);
}

// Mapping functions
export function mapToEmploymentType(type: string | undefined): EmploymentType {
  if (type && Object.values(EmploymentType).includes(type as EmploymentType)) {
    return type as EmploymentType;
  }
  console.warn(`Invalid employment type: ${type}, defaulting to FULL_TIME`);
  return EmploymentType.FULL_TIME;
}

export function mapToLocationType(type: string | undefined): LocationType {
  if (type && Object.values(LocationType).includes(type as LocationType)) {
    return type as LocationType;
  }
  const upperType = type?.toUpperCase().replace(/-/g, "_");
  if (upperType && Object.values(LocationType).includes(upperType as LocationType)) {
    return upperType as LocationType;
  }
  console.warn(`Invalid location type: ${type}, defaulting to ON_SITE`);
  return LocationType.ON_SITE;
}

export function mapToSkillCategory(category: string | undefined): SkillCategory {
  if (category && Object.values(SkillCategory).includes(category as SkillCategory)) {
    return category as SkillCategory;
  }
  const upperCategory = category?.toUpperCase();
  if (upperCategory && Object.values(SkillCategory).includes(upperCategory as SkillCategory)) {
    return upperCategory as SkillCategory;
  }
  console.warn(`Invalid skill category: ${category}, defaulting to TECHNICAL`);
  return SkillCategory.TECHNICAL;
}

export function mapToSkillProficiency(proficiency: string | undefined): SkillProficiency {
  if (proficiency && Object.values(SkillProficiency).includes(proficiency as SkillProficiency)) {
    return proficiency as SkillProficiency;
  }
  const upperProficiency = proficiency?.toUpperCase();
  if (upperProficiency && Object.values(SkillProficiency).includes(upperProficiency as SkillProficiency)) {
    return upperProficiency as SkillProficiency;
  }
  console.warn(`Invalid skill proficiency: ${proficiency}, defaulting to INTERMEDIATE`);
  return SkillProficiency.INTERMEDIATE;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "your_secret_here";

export const resumeRoute = new Hono<HonoEnv>()
  .use(honoJwt({ secret: JWT_SECRET }))
  .use(userContextMiddleware)
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User ID not found in token" }, 401);
    }
    const userId = user.id;

    const resume = await prisma.resume.findUnique({
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
        projects: true,
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
        projects: true,
      },
    });
    console.log("Returning new base resume template", newResume);
    return c.json({ resume: newResume });
  })
  .post("/", async (c) => {
    const authHeader = c.req.header("Authorization");
    let payloadResume;
    try {
      const body = await c.req.json();
      payloadResume = body.resume ?? (body as Resume);
      console.log("POST /api/resume :: authHeader:", authHeader);
      console.log("POST /api/resume :: clientResumeData payload:", payloadResume);
      const authenticatedUser = c.get("user"); // S6582: Prefer optional chaining
      if (!authenticatedUser?.id) {
        return c.json({ error: "Unauthorized: User not found" }, 401);
      }
      const authenticatedUserId = authenticatedUser.id;
      console.log(
        "POST /api/resume :: authenticatedUserId:",
        authenticatedUserId
      );

      const resumeData = payloadResume as Resume & { contact: any, experiences: Experience[], educations: Education[], skills: Skill[], honorsAwards: HonorsAwards[], licenseCertifications: LicenseCertification[], projects: Project[] }; // Add stronger typing if possible
      
      const baseResume = await prisma.resume.findUnique({
        where: {
          userId_conversationId: {
            userId: authenticatedUser?.id,
            conversationId: "", // Target the base resume
          },
        },
        select: { id: true, contactId: true } // Select only necessary fields
      });

      if (!baseResume) {
        throw new Error("Authenticated user's base resume not found."); // Should not happen if beforeEach works, but good practice
      }

      const updatedResume = await prisma.$transaction(async (prisma) => {
        const { id, ...contactData } = resumeData.contact;

        // Find the authenticated user's base resume to get the correct contactId and resumeId

        await prisma.contact.update({
          where: { id: baseResume.contactId }, // Use the contactId from the base resume
          data: { ...contactData }, // Use the data from the request body
        });
        await prisma.experience.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.experiences?.length) {
          await prisma.experience.createMany({
            data: resumeData.experiences.map((exp: Experience) => ({
              ...exp, // Assuming exp structure matches Prisma model fields
              resumeId: baseResume.id, // Use the base resume's ID
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
            })),
          });
        }
        await prisma.education.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.educations?.length) {
          await prisma.education.createMany({
            data: resumeData.educations.map((edu: Education) => ({
              ...edu, // Assuming edu structure matches Prisma model fields
              resumeId: baseResume.id, // Use the base resume's ID
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })),
          });
        }
        await prisma.skill.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.skills?.length) {
          await prisma.skill.createMany({
            data: resumeData.skills.map((skill: Skill) => ({
              ...skill, // Assuming skill structure matches Prisma model fields
              resumeId: baseResume.id, // Use the base resume's ID
            })),
          });
        }
        await prisma.honorsAwards.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.honorsAwards?.length) {
          await prisma.honorsAwards.createMany({
            data: resumeData.honorsAwards.map((award: HonorsAwards) => ({
              ...award, // Assuming award structure matches Prisma model fields
              resumeId: baseResume.id, // Use the base resume's ID
              date: new Date(award.date),
            })),
          });
        }
        await prisma.project.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.projects?.length) {
          await prisma.project.createMany({
            data: resumeData.projects.map((proj: Project) => ({
              ...proj, // Assuming proj structure matches Prisma model fields
              resumeId: baseResume.id, // Use the base resume's ID
              startDate: new Date(proj.startDate),
              endDate: proj.endDate ? new Date(proj.endDate) : null,
            })),
          });
        }
        await prisma.licenseCertification.deleteMany({
          where: {
            resumeId: resumeData.id
          } // TODO: Use baseResume.id here as well
        });
        if (resumeData.licenseCertifications?.length) {
          await prisma.licenseCertification.createMany({
            data: resumeData.licenseCertifications.map(
              (cert: LicenseCertification) => ({
                ...cert, // Assuming cert structure matches Prisma model fields
                resumeId: baseResume.id,
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
              userId: authenticatedUser?.id,
              conversationId: "", // Always target the base resume for this route?
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
            projects: true,
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
        console.error("Error updating resume:", error);
        return c.json({
          success: false,
          message: "Failed to update resume",
          error: error.message || "An unknown error occurred",
        }, 500); // Explicitly set 500 status
      } else {
        // Handle cases where the thrown error is not an instance of Error
        console.error("An unknown error occurred during resume update (non-Error type):", error);
        return c.json({
          success: false,
          message: "Failed to update resume",
          error: "An unknown error occurred (non-Error type)",
        }, 500); // Explicitly set 500 status
      }
    }
  })
  .put("/", async (c) => {
    const authenticatedUser = c.get("user");
    if (!authenticatedUser?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User not found in token" }, 401);
    }
    const userIdFromToken = authenticatedUser?.id;

    const { email, name, role, contactId } = await c.req.json();

    // This validation is based on your other test: "should return 400 if email and contactId are missing"
    if (!email || !contactId) {
      return c.json({ error: "Email and contactId are required" }, 400);
    }

    try {
      // Update the authenticated user's details
      await prisma.user.update({
        where: { id: userIdFromToken },
        data: {
          email, // new email from request body
          name,  // new name from request body (make sure your model/logic handles if it's optional)
          role,  // new role from request body (make sure your model/logic handles if it's optional)
        },
      });

      // Update the contactId of the user's base resume
      const updatedResume = await prisma.resume.update({
        where: {
          userId_conversationId: {
            userId: userIdFromToken, // Use authenticated user's ID
            conversationId: "",     // Target base resume
          },
        },
        data: { contactId }, // new contactId from request body
        include: { // To provide a comprehensive response, similar to other resume endpoints
          contact: true,
          // Add other relations if they are typically expected in the response
        }
      });

      return c.json(updatedResume, 200); // Return the updated resume object

    } catch (error: any) {
      console.error("Error in PUT /api/resume:", error);
      if (error.code === 'P2025') { // Prisma error: Record to update not found
        // This could be if the user's base resume doesn't exist
        return c.json({ error: 'Record to update not found (e.g., user base resume).' }, 404);
      }
      return c.json({ error: 'Failed to update data' }, 500);
    }
  })
  .post("/generate", async (c) => {
    const user = c.get("user");
    if (!user?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User not found" }, 401);
    }
    const userId = user.id;

    const { title, jobDescription } = await c.req.json();
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
        projects: true,
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

    let generatedResume = "",
      coverLetter = "";
    let savedResume = null;
    try {
      const result = await generateResumeWithGemini({
        title,
        jobDescription,
        resume: baseResumeTemplate,
      });
      generatedResume = result.resume;
      coverLetter = result.coverLetter;
      if (
        generatedResume &&
        typeof generatedResume === "object" &&
        typeof (generatedResume as any).objective === "string" &&
        Array.isArray((generatedResume as any).experiences) &&
        Array.isArray((generatedResume as any).educations) &&
        Array.isArray((generatedResume as any).skills)
      ) {
        const r = generatedResume as {
          objective?: string;
          experiences?: Partial<Experience>[];
          educations?: Partial<Education>[];
          skills?: Partial<Skill>[];
          honorsAwards?: Partial<HonorsAwards>[];
          licenseCertifications?: Partial<LicenseCertification>[];
          projects?: Partial<Project>[];
        };

        const { id: oldContactId, ...contactDataToCopy } = existingContact;
        const newContact = await prisma.contact.create({
          data: {
            ...contactDataToCopy,
            email: contactDataToCopy.email ?? "",
            phone: contactDataToCopy.phone ?? "",
          },
        });
        r.experiences = r.experiences?.map(exp => sanitizeDates(exp)) ?? [];
        r.educations = r.educations?.map(edu => sanitizeDates(edu)) ?? [];
        r.honorsAwards = r.honorsAwards?.map(award => sanitizeDates(award)) ?? [];
        r.licenseCertifications = r.licenseCertifications?.map(cert => sanitizeDates(cert)) ?? [];
        r.projects = r.projects?.map(project => sanitizeDates(project)) ?? [];
        const createdConversation = await prisma.conversation.create({
          data: {
            userId,
            title,
            status: "PENDING",
          },
        });
        savedResume = await prisma.resume.create({
          data: {
            userId,
            conversationId: createdConversation.id,
            objective: r.objective ?? "",
            contactId: newContact.id,
            experiences: {
              create: r.experiences?.map((exp) => ({
                title: exp.title ?? "Untitled Experience", // S6606: Prefer ??
                employmentType: mapToEmploymentType(
                  exp.employmentType as string | undefined
                ),
                company: exp.company ?? "Unknown Company",
                location: exp.location ?? "Unknown Location",
                locationType: mapToLocationType(
                  exp.locationType as string | undefined
                ),
                startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                description: exp.description,
              })),
            },
            educations: {
              create: r.educations?.map((edu) => ({
                school: edu.school || "Unknown School",
                degree: edu.degree ?? "N/A", // S6606: Prefer ??
                fieldOfStudy: edu.fieldOfStudy ?? "N/A", // S6606: Prefer ??
                startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
                endDate: edu.endDate ? new Date(edu.endDate) : null,
                gpa: typeof edu.gpa === "number" ? edu.gpa : null,
                gpaMax: typeof edu.gpaMax === "number" ? edu.gpaMax : null,
                location: edu.location,
                description: edu.description,
              })),
            },
            skills: {
              create: r.skills?.map((skill) => ({
                name: skill.name ?? "Unnamed Skill", // S6606: Prefer ??
                proficiency: mapToSkillProficiency(
                  skill.proficiency as string | undefined
                ),
                category: mapToSkillCategory(
                  skill.category as string | undefined
                ),
              })),
            },
            honorsAwards: {
              create: r.honorsAwards?.map((award) => ({
                title: award.title ?? "Untitled Award", // S6606: Prefer ??
                issuer: award.issuer ?? "Unknown Issuer", // S6606: Prefer ??
                date: award.date ? new Date(award.date) : new Date(),
                description: award.description,
              })),
            },
            licenseCertifications: {
              create: r.licenseCertifications?.map((cert) => ({
                name: cert.name ?? "Untitled Certification", // S6606: Prefer ??
                issuer: cert.issuer ?? "Unknown Issuer", // S6606: Prefer ??
                issueDate: cert.issueDate
                  ? new Date(cert.issueDate)
                  : new Date(),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                credentialId: cert.credentialId,
              })),
            },
            projects: {
              create: r.projects?.map((proj) => ({
                title: proj.title ?? "Untitled Project", // S6606: Prefer ??
                startDate: proj.startDate
                  ? new Date(proj.startDate)
                  : new Date(),
                endDate: proj.endDate ? new Date(proj.endDate) : null,
                description: proj.description,
              })),
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
      } else {
        console.error(
          "Gemini output did not match expected resume structure:",
          generatedResume
        );
        throw new Error(
          "Failed to parse generated resume into the required structure."
        );
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
  .get("/list", async (c) => {
    const user = c.get("user");
    if (!user?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User ID not found" }, 401);
    }
    const userId = user.id;
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
        projects: true,
        conversation: true,
      },
    });
    return c.json({ resumes });
  })
  .get("/:id", async (c) => {
    const user = c.get("user");
    if (!user?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User not found" }, 401);
    }
    const userId = user.id; // userId from authenticated user
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
        projects: true,
        conversation: true,
      },
    });
    if (!resume || resume.userId !== userId) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json({ resume });
  })
  .delete("/:id", async (c) => {
    const user = c.get("user");
    if (!user?.id) { // S6582: Prefer optional chaining
      return c.json({ error: "Unauthorized: User ID not found" }, 401);
    }
    const userId = user.id;
    const id = c.req.param("id");
    try {
      const resume = await prisma.resume.findUnique({
        where: { id },
        include: { conversation: true },
      });
      console.log("resume:", resume);
      if (!resume || resume.userId !== userId) {
        return c.json({ error: "Not found" }, 404);
      }
      await prisma.$transaction(async (tx) => {
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
