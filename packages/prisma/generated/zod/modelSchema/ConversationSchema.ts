import { z } from 'zod';
import { StatusSchema } from '../inputTypeSchemas/StatusSchema'

/////////////////////////////////////////
// CONVERSATION SCHEMA
/////////////////////////////////////////

export const ConversationSchema = z.object({
  status: StatusSchema,
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  resumeId: z.string().nullable(),
})

export type Conversation = z.infer<typeof ConversationSchema>

export default ConversationSchema;
