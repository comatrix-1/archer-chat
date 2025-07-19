// src/states/resumeStore.ts

import { create } from 'zustand';
import type { Experience, Education, Skill, Project, Certification, ResumeData } from '~/types/resume';
import { v4 as uuidv4 } from 'uuid';

interface ResumeState {
  resume: ResumeData;
  updateContactInfo: (info: Partial<ResumeData['contactInfo']>) => void;
  updateSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
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
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
}

const initialResumeState: ResumeData = {
  contactInfo: {
    fullName: '',
    email: '',
    phone: '',
  },
  summary: '',
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
      resume: { ...state.resume, contactInfo: { ...state.resume.contactInfo, ...info } },
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
            jobTitle: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: [''],
          },
        ],
      },
    })),
  updateExperience: (id, experience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experiences: state.resume.experiences.map((exp) =>
          exp.id === id ? { ...exp, ...experience } : exp
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
      const reordered = newOrderIds.map((id) =>
        currentExperiences.find((exp) => exp.id === id)
      ).filter(Boolean) as Experience[]; // Filter out undefined if an ID is not found
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
            degree: '',
            institution: '',
            location: '',
            startDate: '',
            endDate: '',
          },
        ],
      },
    })),
  updateEducation: (id, education) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((edu) =>
          edu.id === id ? { ...edu, ...education } : edu
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
      const reordered = newOrderIds.map((id) =>
        currentEducation.find((edu) => edu.id === id)
      ).filter(Boolean) as Education[];
      return {
        resume: { ...state.resume, education: reordered },
      };
    }),

  // Skills
  addSkill: (skill) =>
    set((state) => {
      const skillExists = state.resume.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
      if (skillExists || !skill.name.trim()) return state; // Prevent duplicates and empty skills
      return {
        resume: { ...state.resume, skills: [...state.resume.skills, { ...skill, name: skill.name.trim() }] },
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
            name: '',
            description: '',
          },
        ],
      },
    })),
  updateProject: (id, project) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.map((p) =>
          p.id === id ? { ...p, ...project } : p
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
            name: '',
            issuingOrganization: '',
            date: '',
          },
        ],
      },
    })),
  updateCertification: (id, certification) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.map((cert) =>
          cert.id === id ? { ...cert, ...certification } : cert
        ),
      },
    })),
  removeCertification: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.filter((cert) => cert.id !== id),
      },
    })),
}));