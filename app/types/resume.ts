// export interface ContactInfo {
//   fullName: string;
//   email: string;
//   phone: string;
//   linkedin?: string;
//   github?: string;
//   portfolio?: string;
//   address?: string;
// }

// export interface Experience {
//   id: string; // For drag and drop and unique identification
//   jobTitle: string;
//   company: string;
//   location: string;
//   startDate: Date;
//   endDate: Date;
//   description: string[]; // Array of bullet points
// }

// export interface Education {
//   id: string;
//   degree: string;
//   institution: string;
//   location: string;
//   startDate: string;
//   endDate: string;
//   gpa?: string;
// }

// export interface Skill {
//   name: string;
// }

// export interface Project {
//   id: string;
//   name: string;
//   description: string;
//   link?: string;
//   technologies?: string[];
// }

// export interface Certification {
//   id: string;
//   name: string;
//   issuingOrganization: string;
//   date: string;
// }

// export interface ResumeData {
//   contactInfo: ContactInfo;
//   summary: string;
//   experiences: Experience[];
//   education: Education[];
//   skills: Skill[];
//   projects: Project[];
//   certifications: Certification[];
// }

// export type ResumeSection = keyof ResumeData;