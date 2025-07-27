import { z } from 'zod';

export const MessagePartContentTypeSchema = z.enum(['TEXT','ACTION','POST','GET']);

export type MessagePartContentTypeType = `${z.infer<typeof MessagePartContentTypeSchema>}`

export default MessagePartContentTypeSchema;
