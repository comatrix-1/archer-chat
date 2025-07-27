import { z } from 'zod';

export const MessagePartScalarFieldEnumSchema = z.enum(['id','content','contentType','actionUrl','messageId']);

export default MessagePartScalarFieldEnumSchema;
