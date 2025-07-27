import { z } from 'zod';

export const MessageScalarFieldEnumSchema = z.enum(['id','conversationId','role','content','contentType','createdAt']);

export default MessageScalarFieldEnumSchema;
