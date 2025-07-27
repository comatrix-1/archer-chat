import { z } from 'zod';

/////////////////////////////////////////
// COVER LETTER SCHEMA
/////////////////////////////////////////

export const CoverLetterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  contactId: z.string(),
})

export type CoverLetter = z.infer<typeof CoverLetterSchema>

export default CoverLetterSchema;
