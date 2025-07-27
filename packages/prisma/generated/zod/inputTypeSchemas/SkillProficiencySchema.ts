import { z } from 'zod';

export const SkillProficiencySchema = z.enum(['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT']);

export type SkillProficiencyType = `${z.infer<typeof SkillProficiencySchema>}`

export default SkillProficiencySchema;
