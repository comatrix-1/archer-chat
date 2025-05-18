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
  EmploymentType as EmploymentTypeValue,
  LocationType as LocationTypeValue,
  SkillCategory as SkillCategoryValue,
  SkillProficiency as SkillProficiencyValue,
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
  .post("/", async (c: Context) => {
    const authHeader = c.req.header("Authorization");
    let userId;
    let resume;
    let updatedResume;
    try {
      const body = await c.req.json();
      resume = body.resume ?? (body as Resume);
      console.log("POST /api/resume :: authHeader:", authHeader);
      console.log("POST /api/resume :: resume payload:", resume);
      const payload = c.get("jwtPayload") as { userId: string };
      userId = payload.userId;
      console.log("POST /api/resume :: userId:", userId);
      try {
        const resumeData = resume;
        const updatedResume = await prisma.$transaction(async (prisma) => {
          const { id, ...contactData } = resumeData.contact;
          await prisma.contact.update({
            where: { id },
            data: {
              ...contactData,
            },
          });
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
          });
        } else {
          console.error("An unknown error occurred.");
        }
      }
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
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { name, role },
    });
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
    function mapToEmploymentType(
      type: string | undefined
    ): EmploymentTypeValue {
      if (
        type &&
        Object.values(EmploymentTypeValue).includes(type as EmploymentTypeValue)
      ) {
        return type as EmploymentTypeValue;
      }
      const upperType = type?.toUpperCase().replace(/-/g, "_");
      if (
        upperType &&
        Object.values(EmploymentTypeValue).includes(
          upperType as EmploymentTypeValue
        )
      ) {
        return upperType as EmploymentTypeValue;
      }
      console.warn(
        `Invalid employment type received: ${type}, defaulting to FULL_TIME`
      );
      return EmploymentTypeValue.FULL_TIME;
    }
    function mapToLocationType(type: string | undefined): LocationTypeValue {
      if (
        type &&
        Object.values(LocationTypeValue).includes(type as LocationTypeValue)
      ) {
        return type as LocationTypeValue;
      }
      const upperType = type?.toUpperCase().replace(/-/g, "_");
      if (
        upperType &&
        Object.values(LocationTypeValue).includes(
          upperType as LocationTypeValue
        )
      ) {
        return upperType as LocationTypeValue;
      }
      console.warn(
        `Invalid location type received: ${type}, defaulting to ON_SITE`
      );
      return LocationTypeValue.ON_SITE;
    }
    function mapToSkillCategory(
      category: string | undefined
    ): SkillCategoryValue {
      if (
        category &&
        Object.values(SkillCategoryValue).includes(
          category as SkillCategoryValue
        )
      ) {
        return category as SkillCategoryValue;
      }
      const upperCategory = category?.toUpperCase();
      if (
        upperCategory &&
        Object.values(SkillCategoryValue).includes(
          upperCategory as SkillCategoryValue
        )
      ) {
        return upperCategory as SkillCategoryValue;
      }
      console.warn(
        `Invalid skill category received: ${category}, defaulting to TECHNICAL`
      );
      return SkillCategoryValue.TECHNICAL;
    }
    function mapToSkillProficiency(
      proficiency: string | undefined
    ): SkillProficiencyValue {
      if (
        proficiency &&
        Object.values(SkillProficiencyValue).includes(
          proficiency as SkillProficiencyValue
        )
      ) {
        return proficiency as SkillProficiencyValue;
      }
      const upperProficiency = proficiency?.toUpperCase();
      if (
        upperProficiency &&
        Object.values(SkillProficiencyValue).includes(
          upperProficiency as SkillProficiencyValue
        )
      ) {
        return upperProficiency as SkillProficiencyValue;
      }
      console.warn(
        `Invalid skill proficiency received: ${proficiency}, defaulting to BEGINNER`
      );
      return SkillProficiencyValue.BEGINNER;
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
        function sanitizeDates(obj: any) {
          if (!obj || typeof obj !== "object") return obj;
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
                (typeof val === "string" &&
                  (val.trim() === "" || val.toLowerCase() === "present")) ||
                (typeof val === "string" && isNaN(Date.parse(val)))
              ) {
                obj[key] = null;
              } else {
                if (
                  typeof val === "string" &&
                  /^\d{4}-\d{2}-\d{2}$/.test(val)
                ) {
                  obj[key] = new Date(val + "T00:00:00.000Z").toISOString();
                } else if (
                  typeof val === "string" &&
                  /^\d{4}-\d{2}$/.test(val)
                ) {
                  obj[key] = new Date(val + "-01T00:00:00.000Z").toISOString();
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
        const { id: oldContactId, ...contactDataToCopy } = existingContact;
        const newContact = await prisma.contact.create({
          data: {
            ...contactDataToCopy,
            email: contactDataToCopy.email ?? "",
            phone: contactDataToCopy.phone ?? "",
          },
        });
        r.experiences = r.experiences?.map(sanitizeDates) ?? [];
        r.educations = r.educations?.map(sanitizeDates) ?? [];
        r.honorsAwards = r.honorsAwards?.map(sanitizeDates) ?? [];
        r.licenseCertifications =
          r.licenseCertifications?.map(sanitizeDates) ?? [];
        r.projects = r.projects?.map(sanitizeDates) ?? [];
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
            objective: r.objective || "",
            contactId: newContact.id,
            experiences: {
              create: r.experiences?.map((exp) => ({
                title: exp.title || "Untitled Experience",
                employmentType: mapToEmploymentType(
                  exp.employmentType as string | undefined
                ),
                company: exp.company || "Unknown Company",
                location: exp.location || "Unknown Location",
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
                degree: edu.degree || "N/A",
                fieldOfStudy: edu.fieldOfStudy || "N/A",
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
                name: skill.name || "Unnamed Skill",
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
                title: award.title || "Untitled Award",
                issuer: award.issuer || "Unknown Issuer",
                date: award.date ? new Date(award.date) : new Date(),
                description: award.description,
              })),
            },
            licenseCertifications: {
              create: r.licenseCertifications?.map((cert) => ({
                name: cert.name || "Untitled Certification",
                issuer: cert.issuer || "Unknown Issuer",
                issueDate: cert.issueDate
                  ? new Date(cert.issueDate)
                  : new Date(),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                credentialId: cert.credentialId,
              })),
            },
            projects: {
              create: r.projects?.map((proj) => ({
                title: proj.title || "Untitled Project",
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
  .get("/list", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
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
        projects: true,
        conversation: true,
      },
    });
    if (!resume || resume.userId !== userId) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json({ resume });
  })
  .delete("/:id", async (c: Context) => {
    const payload = c.get("jwtPayload") as { userId: string };
    const userId = payload.userId;
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
