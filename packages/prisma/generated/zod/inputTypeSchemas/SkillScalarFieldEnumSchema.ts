import { z } from 'zod';

export const SkillScalarFieldEnumSchema = z.enum(['id','name','proficiency','category','resumeId']);

export default SkillScalarFieldEnumSchema;
