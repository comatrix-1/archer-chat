// 'use client';

// import { createContext, useContext, useState, type ReactNode, useCallback, useMemo } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// import type { Status, JobApplicationsContextType, JobApplication } from '~/types';

// const defaultStatuses: Status[] = [
//   { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
//   { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
//   { id: 'interview', name: 'Interview', color: 'bg-purple-500' },
//   { id: 'offer', name: 'Offer', color: 'bg-green-500' },
//   { id: 'closed', name: 'Closed', color: 'bg-gray-500' },
// ];

// const JobApplicationsContext = createContext<JobApplicationsContextType | undefined>(undefined);

// export function JobApplicationsProvider({ children }: Readonly<{ children: ReactNode }>) {
//   const [jobs, setJobs] = useState<JobApplication[]>(() => {
//     // Initialize with some mock data
//     const mockJobs: JobApplication[] = Array.from({ length: 5 }).map((_, index) => {
//       const status = defaultStatuses[index % defaultStatuses.length];
//       return {
//         id: uuidv4(),
//         companyName: `Company ${index + 1}`,
//         jobTitle: `Job Title ${index + 1}`,
//         status,
//         jobLink: `https://example.com/job/${index + 1}`,
//         resume: index % 2 === 0 ? `resume-${index + 1}.pdf` : null,
//         coverLetter: index % 3 === 0 ? `cover-letter-${index + 1}.pdf` : null,
//         salary: `$${(Math.floor(Math.random() * 100000) + 50000).toLocaleString()}`,
//         remarks: `This is a sample job application ${index + 1}`,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//     });
//     return mockJobs;
//   });

//   const addJob = useCallback((job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
//     const newJob: JobApplication = {
//       ...job,
//       id: uuidv4(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };
//     setJobs(prevJobs => [newJob, ...prevJobs]);
//   }, []);

//   const updateJob = useCallback((id: string, updates: Partial<JobApplication>) => {
//     setJobs(prevJobs =>
//       prevJobs.map(job =>
//         job.id === id
//           ? { ...job, ...updates, updatedAt: new Date() }
//           : job
//       )
//     );
//   }, []);

//   const deleteJob = useCallback((id: string) => {
//     setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
//   }, []);

//   const getJobById = useCallback((id: string) => {
//     return jobs.find(job => job.id === id);
//   }, [jobs]);

//   const value = useMemo(() => ({
//     jobs,
//     addJob,
//     updateJob,
//     deleteJob,
//     getJobById,
//   }), [jobs, addJob, updateJob, deleteJob, getJobById]);

//   return (
//     <JobApplicationsContext.Provider value={value}>
//       {children}
//     </JobApplicationsContext.Provider>
//   );
// }

// export function useJobApplications() {
//   const context = useContext(JobApplicationsContext);
//   if (context === undefined) {
//     throw new Error('useJobApplications must be used within a JobApplicationsProvider');
//   }
//   return context;
// }

// export const jobStatuses = defaultStatuses;
