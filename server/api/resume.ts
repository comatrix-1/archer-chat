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

interface HonoEnv {
  Variables: {
    user: { id: string };
    jwtPayload: { userId: string;[key: string]: any };
  };
}

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
    console.error(`Failed to parse date value: ${val}`, e);
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
    if (!user?.id) {
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
      const authenticatedUser = c.get("user");
      if (!authenticatedUser?.id) {
        return c.json({ error: "Unauthorized: User not found" }, 401);
      }
      const authenticatedUserId = authenticatedUser.id;
      console.log(
        "POST /api/resume :: authenticatedUserId:",
        authenticatedUserId
      );

      const resumeData = payloadResume as Resume & { contact: any, experiences: Experience[], educations: Education[], skills: Skill[], honorsAwards: HonorsAwards[], licenseCertifications: LicenseCertification[], projects: Project[] };

      const baseResume = await prisma.resume.findUnique({
        where: {
          userId_conversationId: {
            userId: authenticatedUser?.id,
            conversationId: "",
          },
        },
        select: { id: true, contactId: true }
      });

      if (!baseResume) {
        throw new Error("Authenticated user's base resume not found.");
      }

      const updatedResume = await prisma.$transaction(async (prisma) => {
        const { id, ...contactData } = resumeData.contact;

        await prisma.contact.update({
          where: { id: baseResume.contactId },
          data: { ...contactData },
        });
        await prisma.experience.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.experiences?.length) {
          await prisma.experience.createMany({
            data: resumeData.experiences.map((exp: Experience) => ({
              ...exp,
              resumeId: baseResume.id,
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
              ...edu,
              resumeId: baseResume.id,
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
              ...skill,
              resumeId: baseResume.id,
            })),
          });
        }
        await prisma.honorsAwards.deleteMany({
          where: { resumeId: resumeData.id },
        });
        if (resumeData.honorsAwards?.length) {
          await prisma.honorsAwards.createMany({
            data: resumeData.honorsAwards.map((award: HonorsAwards) => ({
              ...award,
              resumeId: baseResume.id,
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
              ...proj,
              resumeId: baseResume.id,
              startDate: new Date(proj.startDate),
              endDate: proj.endDate ? new Date(proj.endDate) : null,
            })),
          });
        }
        await prisma.licenseCertification.deleteMany({
          where: {
            resumeId: resumeData.id
          }
        });
        if (resumeData.licenseCertifications?.length) {
          await prisma.licenseCertification.createMany({
            data: resumeData.licenseCertifications.map(
              (cert: LicenseCertification) => ({
                ...cert,
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
              conversationId: "",
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
        }, 500);
      } else {

        console.error("An unknown error occurred during resume update (non-Error type):", error);
        return c.json({
          success: false,
          message: "Failed to update resume",
          error: "An unknown error occurred (non-Error type)",
        }, 500);
      }
    }
  })
  .put("/", async (c) => {
    const authenticatedUser = c.get("user");
    if (!authenticatedUser?.id) {
      return c.json({ error: "Unauthorized: User not found in token" }, 401);
    }
    const userIdFromToken = authenticatedUser?.id;

    const { email, name, role, contactId } = await c.req.json();

    if (!email || !contactId) {
      return c.json({ error: "Email and contactId are required" }, 400);
    }

    try {

      await prisma.user.update({
        where: { id: userIdFromToken },
        data: {
          email,
          name,
          role,
        },
      });

      const updatedResume = await prisma.resume.update({
        where: {
          userId_conversationId: {
            userId: userIdFromToken,
            conversationId: "",
          },
        },
        data: { contactId },
        include: {
          contact: true,

        }
      });

      return c.json(updatedResume, 200);

    } catch (error: any) {
      console.error("Error in PUT /api/resume:", error);
      if (error.code === 'P2025') {

        return c.json({ error: 'Record to update not found (e.g., user base resume).' }, 404);
      }
      return c.json({ error: 'Failed to update data' }, 500);
    }
  })
  .post("/generate", async (c) => {
    const user = c.get("user");
    if (!user?.id) {
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
                title: exp.title ?? "Untitled Experience",
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
                degree: edu.degree ?? "N/A",
                fieldOfStudy: edu.fieldOfStudy ?? "N/A",
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
                name: skill.name ?? "Unnamed Skill",
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
                title: award.title ?? "Untitled Award",
                issuer: award.issuer ?? "Unknown Issuer",
                date: award.date ? new Date(award.date) : new Date(),
                description: award.description,
              })),
            },
            licenseCertifications: {
              create: r.licenseCertifications?.map((cert) => ({
                name: cert.name ?? "Untitled Certification",
                issuer: cert.issuer ?? "Unknown Issuer",
                issueDate: cert.issueDate
                  ? new Date(cert.issueDate)
                  : new Date(),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                credentialId: cert.credentialId,
              })),
            },
            projects: {
              create: r.projects?.map((proj) => ({
                title: proj.title ?? "Untitled Project",
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
    if (!user?.id) {
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
    if (!user?.id) {
      return c.json({ error: "Unauthorized: User not found" }, 401);
    }
    const userId = user.id;
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
    if (!user?.id) {
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