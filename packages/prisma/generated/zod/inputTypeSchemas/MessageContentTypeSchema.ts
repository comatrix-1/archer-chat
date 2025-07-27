import { z } from 'zod';

export const MessageContentTypeSchema = z.enum(['TEXT_AND_ACTION','TEXT']);

export type MessageContentTypeType = `${z.infer<typeof MessageContentTypeSchema>}`

export default MessageContentTypeSchema;
