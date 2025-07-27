import { z } from 'zod';
import { MessagePartContentTypeSchema } from '../inputTypeSchemas/MessagePartContentTypeSchema'

/////////////////////////////////////////
// MESSAGE PART SCHEMA
/////////////////////////////////////////

export const MessagePartSchema = z.object({
  contentType: MessagePartContentTypeSchema,
  id: z.string(),
  content: z.string(),
  actionUrl: z.string().nullable(),
  messageId: z.string().nullable(),
})

export type MessagePart = z.infer<typeof MessagePartSchema>

export default MessagePartSchema;
