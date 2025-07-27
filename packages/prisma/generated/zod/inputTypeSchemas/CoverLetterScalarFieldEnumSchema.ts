import { z } from 'zod';

export const CoverLetterScalarFieldEnumSchema = z.enum(['id','userId','content','createdAt','updatedAt','contactId']);

export default CoverLetterScalarFieldEnumSchema;
