import { z } from 'zod';

export const ConversationScalarFieldEnumSchema = z.enum(['id','title','description','status','userId','createdAt','updatedAt','resumeId']);

export default ConversationScalarFieldEnumSchema;
