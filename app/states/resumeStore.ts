import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  address?: string;
}

// export interface Experience {
//   id: string; // For drag and drop and unique identification
//   jobTitle: string;
//   company: string;
//   location: string;
//   startDate: Date;
//   endDate: Date;
//   description: string[]; // Array of bullet points
// }

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

const experienceItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Job title is required"),
  employmentType: z.nativeEnum(EEmploymentType),
  locationType: z.nativeEnum(ELocationType),
  company: z.string().min(1, "Company is required"),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.array(z.string()).transform((arr) => arr.filter(Boolean)),
});

const experienceSchema = z.object({
  experiences: z.array(experienceItemSchema),
});

type TExperienceItem = z.infer<typeof experienceItemSchema>;
type TExperienceFormValues = z.infer<typeof experienceSchema>;

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Skill {
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
}

export interface ResumeData {
  contactInfo: ContactInfo;
  summary: string;
  experiences: TExperienceItem[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

export type ResumeSection = keyof ResumeData;

interface ResumeState {
  resume: ResumeData;
  updateContactInfo: (info: Partial<ResumeData["contactInfo"]>) => void;
  updateSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<TExperienceItem>) => void;
  removeExperience: (id: string) => void;
  reorderExperiences: (newOrder: string[]) => void;
  addEducation: () => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (newOrder: string[]) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (skillName: string) => void;
  addProject: () => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addCertification: () => void;
  updateCertification: (
    id: string,
    certification: Partial<Certification>,
  ) => void;
  removeCertification: (id: string) => void;
}

const initialResumeState: ResumeData = {
  contactInfo: {
    fullName: "",
    email: "",
    phone: "",
  },
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

export const useResumeStore = create<ResumeState>((set, get) => ({
  resume: initialResumeState,
  updateContactInfo: (info) =>
    set((state) => ({
      resume: {
        ...state.resume,
        contactInfo: { ...state.resume.contactInfo, ...info },
      },
    })),
  updateSummary: (summary) =>
    set((state) => ({
      resume: { ...state.resume, summary },
    })),

  // Experiences
  addExperience: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        experiences: [
          ...state.resume.experiences,
          {
            id: uuidv4(),
            title: "",
            employmentType: EEmploymentType.FULL_TIME,
            locationType: ELocationType.ON_SITE,
            company: "",
            location: "",
            startDate: new Date(),
            endDate: new Date(),
            description: [""],
          },
        ],
      },
    })),
  updateExperience: (id, experience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experiences: state.resume.experiences.map((exp) =>
          exp.id === id ? { ...exp, ...experience } : exp,
        ),
      },
    })),
  removeExperience: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experiences: state.resume.experiences.filter((exp) => exp.id !== id),
      },
    })),
  reorderExperiences: (newOrderIds) =>
    set((state) => {
      const currentExperiences = [...state.resume.experiences];
      const reordered = newOrderIds
        .map((id) => currentExperiences.find((exp) => exp.id === id))
        .filter(Boolean) as TExperienceItem[]; // Filter out undefined if an ID is not found
      return {
        resume: { ...state.resume, experiences: reordered },
      };
    }),

  // Education
  addEducation: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: [
          ...state.resume.education,
          {
            id: uuidv4(),
            degree: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
          },
        ],
      },
    })),
  updateEducation: (id, education) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((edu) =>
          edu.id === id ? { ...edu, ...education } : edu,
        ),
      },
    })),
  removeEducation: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((edu) => edu.id !== id),
      },
    })),
  reorderEducation: (newOrderIds) =>
    set((state) => {
      const currentEducation = [...state.resume.education];
      const reordered = newOrderIds
        .map((id) => currentEducation.find((edu) => edu.id === id))
        .filter(Boolean) as Education[];
      return {
        resume: { ...state.resume, education: reordered },
      };
    }),

  // Skills
  addSkill: (skill) =>
    set((state) => {
      const skillExists = state.resume.skills.some(
        (s) => s.name.toLowerCase() === skill.name.toLowerCase(),
      );
      if (skillExists || !skill.name.trim()) return state; // Prevent duplicates and empty skills
      return {
        resume: {
          ...state.resume,
          skills: [
            ...state.resume.skills,
            { ...skill, name: skill.name.trim() },
          ],
        },
      };
    }),
  removeSkill: (skillName) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.filter((s) => s.name !== skillName),
      },
    })),

  // Projects
  addProject: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: [
          ...state.resume.projects,
          {
            id: uuidv4(),
            name: "",
            description: "",
          },
        ],
      },
    })),
  updateProject: (id, project) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.map((p) =>
          p.id === id ? { ...p, ...project } : p,
        ),
      },
    })),
  removeProject: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.filter((p) => p.id !== id),
      },
    })),

  // Certifications
  addCertification: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: [
          ...state.resume.certifications,
          {
            id: uuidv4(),
            name: "",
            issuingOrganization: "",
            date: "",
          },
        ],
      },
    })),
  updateCertification: (id, certification) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.map((cert) =>
          cert.id === id ? { ...cert, ...certification } : cert,
        ),
      },
    })),
  removeCertification: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.filter(
          (cert) => cert.id !== id,
        ),
      },
    })),
}));
