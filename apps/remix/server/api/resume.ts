// import type { PrismaClient } from "@prisma/client";
// import prisma from "@project/remix/app/utils/prisma.js";
// import { Hono } from "hono";
// import { jwt as honoJwt } from "hono/jwt";
// import { userContextMiddleware } from "server/middleware/userContext.js";
// import { sanitizeDates } from "server/utils/dates";
// import { mapToEmploymentType, mapToLocationType, mapToSkillCategory, mapToSkillProficiency } from "server/utils/mapping";
// import { generateResumeWithGemini } from "../utils/generateResumeWithGemini.js";
// import type {
//     TAward,
//     TCertification,
//     TContact,
//     TEducation,
//     TExperience,
//     TProject,
//     TResume,
//     TSkill
// } from "./resume.types";
// import type { HonoEnv } from "../router";

// const JWT_SECRET = process.env.JWT_SECRET ?? "your_secret_here";

// export const resumeRoute = new Hono<HonoEnv>()
//     .use(honoJwt({ secret: JWT_SECRET }))
//     .use(userContextMiddleware)
//     .get("/", async (c) => {
//         const user = c.get("user");
//         if (!user?.id) {
//             return c.json({ error: "Unauthorized: User ID not found in token" }, 401);
//         }
//         const userId = user.id;

//         const resume = await prisma.resume.findUnique({
//             where: {
//                 userId_conversationId: {
//                     userId,
//                     conversationId: "",
//                 },
//             },
//             include: {
//                 contact: true,
//                 experiences: true,
//                 educations: true,
//                 skills: true,
//                 awards: true,
//                 certifications: true,
//                 projects: true,
//             },
//         });
//         if (resume) {
//             return c.json({ resume });
//         }

//         console.log("Base resume template not found, creating new one");

//         const contact = await prisma.contact.create({
//             data: {
//                 email: "",
//                 phone: "",
//                 linkedin: "",
//                 portfolio: "",
//                 city: "",
//                 country: "",
//             },
//         });
//         const newResume = await prisma.resume.create({
//             data: {
//                 userId,
//                 conversationId: "",
//                 summary: "",
//                 contactId: contact.id,
//             },
//             include: {
//                 contact: true,
//                 experiences: true,
//                 educations: true,
//                 skills: true,
//                 awards: true,
//                 certifications: true,
//                 projects: true,
//             },
//         });
//         console.log("Returning new base resume template", newResume);
//         return c.json({ resume: newResume });
//     })
//     .post("/", async (c) => {
//         const authHeader = c.req.header("Authorization");
//         let payloadResume: any;
//         try {
//             const body = await c.req.json();
//             payloadResume = body.resume ?? (body as TResume);
//             console.log("POST /api/resume :: authHeader:", authHeader);
//             console.log(
//                 "POST /api/resume :: clientResumeData payload:",
//                 payloadResume,
//             );
//             const authenticatedUser = c.get("user");
//             if (!authenticatedUser?.id) {
//                 return c.json({ error: "Unauthorized: User not found" }, 401);
//             }
//             const authenticatedUserId = authenticatedUser.id;
//             console.log(
//                 "POST /api/resume :: authenticatedUserId:",
//                 authenticatedUserId,
//             );

//             const resumeData = payloadResume as TResume & {
//                 contact: TContact;
//                 experiences: TExperience[];
//                 educations: TEducation[];
//                 skills: TSkill[];
//                 awards: TAward[];
//                 certifications: TCertification[];
//                 projects: TProject[];
//             };

//             const baseResume = await prisma.resume.findUnique({
//                 where: {
//                     userId_conversationId: {
//                         userId: authenticatedUser?.id,
//                         conversationId: "",
//                     },
//                 },
//                 select: { id: true, contactId: true },
//             });

//             if (!baseResume) {
//                 throw new Error("Authenticated user's base resume not found.");
//             }

//             const updatedResume = await prisma.$transaction(async (prisma: PrismaClient) => {
//                 const { id, ...contactData } = resumeData.contact;

//                 await prisma.contact.update({
//                     where: { id: baseResume.contactId },
//                     data: { ...contactData },
//                 });
//                 await prisma.experience.deleteMany({
//                     where: { resumeId: resumeData.id },
//                 });
//                 if (resumeData.experiences?.length) {
//                     await prisma.experience.createMany({
//                         data: resumeData.experiences.map((exp: TExperience) => ({
//                             ...exp,
//                             resumeId: baseResume.id,
//                             startDate: new Date(exp.startDate),
//                             endDate: exp.endDate ? new Date(exp.endDate) : null,
//                         })),
//                     });
//                 }
//                 await prisma.education.deleteMany({
//                     where: { resumeId: resumeData.id },
//                 });
//                 if (resumeData.educations?.length) {
//                     await prisma.education.createMany({
//                         data: resumeData.educations.map((edu: TEducation) => ({
//                             ...edu,
//                             resumeId: baseResume.id,
//                             startDate: new Date(edu.startDate),
//                             endDate: edu.endDate ? new Date(edu.endDate) : null,
//                         })),
//                     });
//                 }
//                 await prisma.skill.deleteMany({
//                     where: { resumeId: resumeData.id },
//                 });
//                 if (resumeData.skills?.length) {
//                     await prisma.skill.createMany({
//                         data: resumeData.skills.map((skill: TSkill) => ({
//                             ...skill,
//                             resumeId: baseResume.id,
//                         })),
//                     });
//                 }
//                 await prisma.award.deleteMany({
//                     where: { resumeId: resumeData.id },
//                 });
//                 if (resumeData.awards?.length) {
//                     await prisma.award.createMany({
//                         data: resumeData.awards.map((award: TAward) => ({
//                             ...award,
//                             resumeId: baseResume.id,
//                             date: award.date ? new Date(award.date) : null,
//                         })),
//                     });
//                 }
//                 await prisma.project.deleteMany({
//                     where: { resumeId: resumeData.id },
//                 });
//                 if (resumeData.projects?.length) {
//                     await prisma.project.createMany({
//                         data: resumeData.projects.map((proj: TProject) => ({
//                             ...proj,
//                             resumeId: baseResume.id,
//                             startDate: new Date(proj.startDate),
//                             endDate: proj.endDate ? new Date(proj.endDate) : null,
//                         })),
//                     });
//                 }
//                 await prisma.certification.deleteMany({
//                     where: {
//                         resumeId: resumeData.id,
//                     },
//                 });
//                 if (resumeData.certifications?.length) {
//                     await prisma.certification.createMany({
//                         data: resumeData.certifications.map(
//                             (cert: TCertification) => ({
//                                 ...cert,
//                                 resumeId: baseResume.id,
//                                 issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
//                                 expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
//                             }),
//                         ),
//                     });
//                 }
//                 return prisma.resume.update({
//                     where: {
//                         userId_conversationId: {
//                             userId: authenticatedUser?.id,
//                             conversationId: "",
//                         },
//                     },
//                     data: {
//                         summary: resumeData.summary,
//                     },
//                     include: {
//                         contact: true,
//                         experiences: true,
//                         educations: true,
//                         skills: true,
//                         awards: true,
//                         certifications: true,
//                         projects: true,
//                     },
//                 });
//             });
//             console.log("Resume updated successfully");
//             return c.json({
//                 success: true,
//                 message: "Resume updated successfully",
//                 resume: updatedResume,
//             });
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 console.error("Error updating resume:", error);
//                 return c.json(
//                     {
//                         success: false,
//                         message: "Failed to update resume",
//                         error: error.message || "An unknown error occurred",
//                     },
//                     500,
//                 );
//             }


//             console.error(
//                 "An unknown error occurred during resume update (non-Error type):",
//                 error,
//             );
//             return c.json(
//                 {
//                     success: false,
//                     message: "Failed to update resume",
//                     error: "An unknown error occurred (non-Error type)",
//                 },
//                 500,
//             );
//         }
//     })
//     .put("/", async (c) => {
//         const authenticatedUser = c.get("user");
//         if (!authenticatedUser?.id) {
//             return c.json({ error: "Unauthorized: User not found in token" }, 401);
//         }
//         const userIdFromToken = authenticatedUser?.id;

//         const { email, name, role, contactId } = await c.req.json();

//         if (!email || !contactId) {
//             return c.json({ error: "Email and contactId are required" }, 400);
//         }

//         try {
//             await prisma.user.update({
//                 where: { id: userIdFromToken },
//                 data: {
//                     email,
//                     name,
//                     role,
//                 },
//             });

//             const updatedResume = await prisma.resume.update({
//                 where: {
//                     userId_conversationId: {
//                         userId: userIdFromToken,
//                         conversationId: "",
//                     },
//                 },
//                 data: { contactId },
//                 include: {
//                     contact: true,
//                 },
//             });

//             return c.json(updatedResume, 200);
//         } catch (error: any) {
//             console.error("Error in PUT /api/resume:", error);
//             if (error.code === "P2025") {
//                 return c.json(
//                     { error: "Record to update not found (e.g., user base resume)." },
//                     404,
//                 );
//             }
//             return c.json({ error: "Failed to update data" }, 500);
//         }
//     })
//     .post("/generate", async (c) => {
//         const user = c.get("user");
//         if (!user?.id) {
//             return c.json({ error: "Unauthorized: User not found" }, 401);
//         }
//         const userId = user.id;

//         const { title, jobDescription } = await c.req.json();
//         const baseResumeTemplate = await prisma.resume.findUnique({
//             where: {
//                 userId_conversationId: {
//                     userId,
//                     conversationId: "",
//                 },
//             },
//             include: {
//                 experiences: true,
//                 educations: true,
//                 skills: true,
//                 awards: true,
//                 certifications: true,
//                 projects: true,
//             },
//         });
//         console.log("Base resume template:", baseResumeTemplate);
//         if (!baseResumeTemplate) {
//             return c.json({ error: "Resume not found" }, 404);
//         }
//         const existingContact = await prisma.contact.findUnique({
//             where: { id: baseResumeTemplate.contactId },
//         });
//         if (!existingContact) {
//             return c.json({ error: "Contact not found" }, 404);
//         }

//         let generatedResume = ""
//         let coverLetter = "";
//         let savedResume = null;
//         try {
//             const result = await generateResumeWithGemini({
//                 title,
//                 jobDescription,
//                 resume: baseResumeTemplate,
//             });
//             generatedResume = result.resume;
//             coverLetter = result.coverLetter;
//             if (
//                 generatedResume &&
//                 typeof generatedResume === "object" &&
//                 typeof (generatedResume as { summary: string }).summary === "string" &&
//                 Array.isArray((generatedResume as { experiences: Partial<TExperience>[] }).experiences) &&
//                 Array.isArray((generatedResume as { educations: Partial<TEducation>[] }).educations) &&
//                 Array.isArray((generatedResume as { skills: Partial<TSkill>[] }).skills)
//             ) {
//                 const r = generatedResume as {
//                     summary?: string;
//                     experiences?: Partial<TExperience>[];
//                     educations?: Partial<TEducation>[];
//                     skills?: Partial<TSkill>[];
//                     awards?: Partial<TAward>[];
//                     certifications?: Partial<TCertification>[];
//                     projects?: Partial<TProject>[];
//                 };

//                 const { id: oldContactId, ...contactDataToCopy } = existingContact;
//                 const newContact = await prisma.contact.create({
//                     data: {
//                         ...contactDataToCopy,
//                         email: contactDataToCopy.email ?? "",
//                         phone: contactDataToCopy.phone ?? "",
//                     },
//                 });
//                 r.experiences = r.experiences?.map((exp) => sanitizeDates(exp)) ?? [];
//                 r.educations = r.educations?.map((edu) => sanitizeDates(edu)) ?? [];
//                 r.awards =
//                     r.awards?.map((award) => sanitizeDates(award)) ?? [];
//                 r.certifications =
//                     r.certifications?.map((cert) => sanitizeDates(cert)) ?? [];
//                 r.projects = r.projects?.map((project) => sanitizeDates(project)) ?? [];
//                 const createdConversation = await prisma.conversation.create({
//                     data: {
//                         userId,
//                         title,
//                         status: "PENDING",
//                     },
//                 });
//                 savedResume = await prisma.resume.create({
//                     data: {
//                         userId,
//                         conversationId: createdConversation.id,
//                         summary: r.summary ?? "",
//                         contactId: newContact.id,
//                         experiences: {
//                             create: r.experiences?.map((exp) => ({
//                                 title: exp.title ?? "Untitled Experience",
//                                 employmentType: mapToEmploymentType(
//                                     exp.employmentType as string | undefined,
//                                 ),
//                                 company: exp.company ?? "Unknown Company",
//                                 location: exp.location ?? "Unknown Location",
//                                 locationType: mapToLocationType(
//                                     exp.locationType as string | undefined,
//                                 ),
//                                 startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
//                                 endDate: exp.endDate ? new Date(exp.endDate) : null,
//                                 description: exp.description,
//                             })),
//                         },
//                         educations: {
//                             create: r.educations?.map((edu) => ({
//                                 school: edu.school || "Unknown School",
//                                 degree: edu.degree ?? "N/A",
//                                 fieldOfStudy: edu.fieldOfStudy ?? "N/A",
//                                 startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
//                                 endDate: edu.endDate ? new Date(edu.endDate) : null,
//                                 gpa: typeof edu.gpa === "number" ? edu.gpa : null,
//                                 gpaMax: typeof edu.gpaMax === "number" ? edu.gpaMax : null,
//                                 location: edu.location,
//                                 description: edu.description,
//                             })),
//                         },
//                         skills: {
//                             create: r.skills?.map((skill) => ({
//                                 name: skill.name ?? "Unnamed Skill",
//                                 proficiency: mapToSkillProficiency(
//                                     skill.proficiency as string | undefined,
//                                 ),
//                                 category: mapToSkillCategory(
//                                     skill.category as string | undefined,
//                                 ),
//                             })),
//                         },
//                         awards: {
//                             create: r.awards?.map((award) => ({
//                                 title: award.title ?? "Untitled Award",
//                                 issuer: award.issuer ?? "Unknown Issuer",
//                                 date: award.date ? new Date(award.date) : new Date(),
//                                 description: award.description,
//                             })),
//                         },
//                         certifications: {
//                             create: r.certifications?.map((cert) => ({
//                                 name: cert.name ?? "Untitled Certification",
//                                 issuer: cert.issuer ?? "Unknown Issuer",
//                                 issueDate: cert.issueDate
//                                     ? new Date(cert.issueDate)
//                                     : new Date(),
//                                 expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
//                                 credentialId: cert.credentialId,
//                             })),
//                         },
//                         projects: {
//                             create: r.projects?.map((proj) => ({
//                                 title: proj.title ?? "Untitled Project",
//                                 startDate: proj.startDate
//                                     ? new Date(proj.startDate)
//                                     : new Date(),
//                                 endDate: proj.endDate ? new Date(proj.endDate) : null,
//                                 description: proj.description,
//                             })),
//                         },
//                     },
//                     include: {
//                         contact: true,
//                         experiences: true,
//                         educations: true,
//                         skills: true,
//                         awards: true,
//                         certifications: true,
//                         projects: true,
//                         conversation: true,
//                     },
//                 });
//                 await prisma.conversation.update({
//                     where: { id: createdConversation.id },
//                     data: { resumeId: savedResume.id },
//                 });
//             } else {
//                 console.error(
//                     "Gemini output did not match expected resume structure:",
//                     generatedResume,
//                 );
//                 throw new Error(
//                     "Failed to parse generated resume into the required structure.",
//                 );
//             }
//         } catch (error) {
//             console.error("Gemini LLM generation error:", error);
//             generatedResume = "Error generating resume.";
//             coverLetter = "Error generating cover letter.";
//         }
//         return c.json({
//             resume: generatedResume,
//             coverLetter,
//         });
//     })
//     .get("/list", async (c) => {
//         const user = c.get("user");
//         if (!user?.id) {
//             return c.json({ error: "Unauthorized: User ID not found" }, 401);
//         }
//         const userId = user.id;
//         const resumes = await prisma.resume.findMany({
//             where: {
//                 userId,
//                 conversationId: {
//                     not: null,
//                     notIn: [""],
//                 },
//             },
//             orderBy: { id: "desc" },
//             include: {
//                 contact: true,
//                 experiences: true,
//                 educations: true,
//                 skills: true,
//                 awards: true,
//                 certifications: true,
//                 projects: true,
//                 conversation: true,
//             },
//         });
//         return c.json({ resumes });
//     })
//     .get("/:id", async (c) => {
//         const user = c.get("user");
//         if (!user?.id) {
//             return c.json({ error: "Unauthorized: User not found" }, 401);
//         }
//         const userId = user.id;
//         const id = c.req.param("id");
//         const resume = await prisma.resume.findUnique({
//             where: { id },
//             include: {
//                 contact: true,
//                 experiences: true,
//                 educations: true,
//                 skills: true,
//                 awards: true,
//                 certifications: true,
//                 projects: true,
//                 conversation: true,
//             },
//         });
//         if (!resume || resume.userId !== userId) {
//             return c.json({ error: "Not found" }, 404);
//         }
//         return c.json({ resume });
//     })
//     .delete("/:id", async (c) => {
//         const user = c.get("user");
//         if (!user?.id) {
//             return c.json({ error: "Unauthorized: User ID not found" }, 401);
//         }
//         const userId = user.id;
//         const id = c.req.param("id");
//         try {
//             const resume = await prisma.resume.findUnique({
//                 where: { id },
//                 include: { conversation: true },
//             });
//             console.log("resume:", resume);
//             if (!resume || resume.userId !== userId) {
//                 return c.json({ error: "Not found" }, 404);
//             }
//             await prisma.$transaction(async (tx: any) => {
//                 console.log(`Attempting to delete resume with ID: ${id}`);
//                 await tx.resume.delete({ where: { id } });
//             });
//             return c.json({ message: "Resume deleted successfully" });
//         } catch (error) {
//             console.error("Error deleting resume:", error);
//             return c.json({ error: "Failed to delete resume" }, 500);
//         }
//     });
// export default resumeRoute;
