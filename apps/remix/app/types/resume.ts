import { z } from "zod";

export enum EEmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  FREELANCE = "FREELANCE",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  APPRENTICESHIP = "APPRENTICESHIP",
  SEASONAL = "SEASONAL",
}

export enum ELocationType {
  ON_SITE = "ON_SITE",
  HYBRID = "HYBRID",
  REMOTE = "REMOTE",
}

export const experienceItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Job title is required"),
  employmentType: z.nativeEnum(EEmploymentType),
  locationType: z.nativeEnum(ELocationType),
  company: z.string().min(1, "Company is required"),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string(),
});

export const experienceSchema = z.object({
  experiences: z.array(experienceItemSchema),
});

export type TExperienceItem = z.infer<typeof experienceItemSchema>;
export type TExperienceFormValues = z.infer<typeof experienceSchema>;

const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School is required"),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
  gpa: z.number().optional(),
  gpaMax: z.number().optional(),
  description: z.string().optional(),
  fieldOfStudy: z.string().optional(),
});

const educationSchema = z.object({
  education: z.array(educationItemSchema),
});

export type TEducationItem = z.infer<typeof educationItemSchema>;
export type TEducationFormValues = z.infer<typeof educationSchema>;

export const contactInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  portfolio: z.string().url().optional(),
});

export type TContact = z.infer<typeof contactInfoSchema>;

const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
});

export type TSkill = z.infer<typeof skillSchema>;

const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.date().optional(),
  expirationDate: z.date().nullable().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional(),
});

export type TCertification = z.infer<typeof certificationSchema>;

const projectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
});

export type TProjectItem = z.infer<typeof projectItemSchema>;

const awardItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.date().nullable().optional(),
  description: z.string(),
});

export type THonorAwardItem = z.infer<typeof awardItemSchema>;

export type ResumeFormData = {
  contact: TContact;
  summary: string;
  experiences: TExperienceItem[];
  educations: TEducationItem[];
  skills: TSkill[];
  certifications: TCertification[];
  projects: TProjectItem[];
  awards: THonorAwardItem[];
};

export interface IResumeItem {
  id: string;
  title: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
  conversation?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    resumeId?: string;
    userId?: string;
  };
}

export enum EResumeSteps {
  CONTACT = "Contact",
  SUMMARY = "Summary",
  EXPERIENCE = "Experience",
  EDUCATION = "Education",
  SKILLS = "Skills",
  PROJECTS = "Projects",
  CERTIFICATIONS = "Certifications",
  AWARDS = "Awards",
}

export type Step = {
  id: EResumeSteps;
  title: EResumeSteps;
};

export const steps: Step[] = [
  { id: EResumeSteps.CONTACT, title: EResumeSteps.CONTACT },
  { id: EResumeSteps.SUMMARY, title: EResumeSteps.SUMMARY },
  { id: EResumeSteps.EXPERIENCE, title: EResumeSteps.EXPERIENCE },
  { id: EResumeSteps.EDUCATION, title: EResumeSteps.EDUCATION },
  { id: EResumeSteps.SKILLS, title: EResumeSteps.SKILLS },
  { id: EResumeSteps.PROJECTS, title: EResumeSteps.PROJECTS },
  { id: EResumeSteps.CERTIFICATIONS, title: EResumeSteps.CERTIFICATIONS },
  { id: EResumeSteps.AWARDS, title: EResumeSteps.AWARDS },
];
