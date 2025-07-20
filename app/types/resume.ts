import { z } from "zod";

export enum EEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCE = 'FREELANCE',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
  SEASONAL = 'SEASONAL',
}

export enum ELocationType {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}

export const experienceItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Job title is required'),
  employmentType: z.nativeEnum(EEmploymentType),
  locationType: z.nativeEnum(ELocationType),
  company: z.string().min(1, 'Company is required'),
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

export type ResumeFormData = {
  contactInfo: TContactInfo;
  summary: string;
  experiences: TExperienceItem[];
  educations: TEducationItem[];
};

const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, 'Degree is required'),
  school: z.string().min(1, 'School is required'),
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
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  portfolio: z.string().url().optional(),
});

export type TContactInfo = z.infer<typeof contactInfoSchema>; 