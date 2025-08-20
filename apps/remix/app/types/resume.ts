import type {
  EmploymentType,
  LocationType,
  Education,
  Experience,
  Skill,
  SkillCategory,
  SkillProficiency,
  Certification,
  Award,
  Project,
} from "@prisma/client";
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
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "SELF_EMPLOYED",
    "FREELANCE",
    "CONTRACT",
    "INTERNSHIP",
    "APPRENTICESHIP",
    "SEASONAL",
  ]),
  locationType: z.enum(["ON_SITE", "HYBRID", "REMOTE"]),
  company: z.string().min(1, "Company is required"),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string().nullable(),
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
  location: z.string().nullable().optional(),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
  gpa: z.number().optional(),
  gpaMax: z.number().optional(),
  description: z.string().nullable().optional(),
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
  country: z.string().nullish(),
  city: z.string().nullish(),
  address: z.string().nullish(),
  linkedin: z.string().url().nullish(),
  github: z.string().url().nullish(),
  portfolio: z.string().url().nullish(), // Changed from .optional()
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

export type Resume = {
  id: string;
  name: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
};

export type ResumeFormDataPlain = {
  objective: string;
  contact: TContact;
  experiences: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType | string;
    locationType: LocationType | string;
  })[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: (Omit<
    Skill,
    "resumeId" | "createdAt" | "updatedAt" | "category" | "proficiency"
  > & {
    category: SkillCategory | string;
    proficiency: SkillProficiency | string;
  })[];
  certifications: Omit<Certification, "resumeId" | "createdAt" | "updatedAt">[];
  awards: Omit<Award, "resumeId" | "createdAt" | "updatedAt">[];
  projects: Omit<Project, "resumeId" | "createdAt" | "updatedAt">[];
};
