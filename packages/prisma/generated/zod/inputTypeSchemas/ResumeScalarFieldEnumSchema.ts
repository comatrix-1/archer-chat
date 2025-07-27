import { z } from 'zod';

export const ResumeScalarFieldEnumSchema = z.enum(['id','userId','summary','contactId','conversationId']);

export default ResumeScalarFieldEnumSchema;
