import { z } from 'zod';

export const AwardScalarFieldEnumSchema = z.enum(['id','title','issuer','date','description','resumeId']);

export default AwardScalarFieldEnumSchema;
