import { z } from 'zod';

/////////////////////////////////////////
// PROJECT SCHEMA
/////////////////////////////////////////

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  description: z.string().nullable(),
  resumeId: z.string(),
})

export type Project = z.infer<typeof ProjectSchema>

export default ProjectSchema;
