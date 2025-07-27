import { z } from 'zod';
import { MessageContentTypeSchema } from '../inputTypeSchemas/MessageContentTypeSchema'

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

export const MessageSchema = z.object({
  contentType: MessageContentTypeSchema.nullable(),
  id: z.string(),
  conversationId: z.string(),
  role: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>

export default MessageSchema;
