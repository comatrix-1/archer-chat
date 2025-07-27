import { z } from 'zod';

/////////////////////////////////////////
// AWARD SCHEMA
/////////////////////////////////////////

export const AwardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.coerce.date().nullable(),
  description: z.string(),
  resumeId: z.string(),
})

export type Award = z.infer<typeof AwardSchema>

export default AwardSchema;
