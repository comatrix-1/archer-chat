import { z } from 'zod';
import { EmploymentTypeSchema } from '../inputTypeSchemas/EmploymentTypeSchema'
import { LocationTypeSchema } from '../inputTypeSchemas/LocationTypeSchema'

/////////////////////////////////////////
// EXPERIENCE SCHEMA
/////////////////////////////////////////

export const ExperienceSchema = z.object({
  employmentType: EmploymentTypeSchema,
  locationType: LocationTypeSchema,
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  description: z.string().nullable(),
  resumeId: z.string(),
})

export type Experience = z.infer<typeof ExperienceSchema>

export default ExperienceSchema;
