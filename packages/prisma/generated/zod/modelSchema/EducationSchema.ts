import { z } from 'zod';

/////////////////////////////////////////
// EDUCATION SCHEMA
/////////////////////////////////////////

export const EducationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  gpa: z.number().nullable(),
  gpaMax: z.number().nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  resumeId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Education = z.infer<typeof EducationSchema>

export default EducationSchema;
