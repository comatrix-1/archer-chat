import { z } from 'zod';

/////////////////////////////////////////
// RESUME SCHEMA
/////////////////////////////////////////

export const ResumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  summary: z.string(),
  contactId: z.string(),
  conversationId: z.string().nullable(),
})

export type Resume = z.infer<typeof ResumeSchema>

export default ResumeSchema;
