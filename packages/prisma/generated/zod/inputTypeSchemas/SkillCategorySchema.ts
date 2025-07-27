import { z } from 'zod';

export const SkillCategorySchema = z.enum(['TECHNICAL','SOFT','LANGUAGE']);

export type SkillCategoryType = `${z.infer<typeof SkillCategorySchema>}`

export default SkillCategorySchema;
