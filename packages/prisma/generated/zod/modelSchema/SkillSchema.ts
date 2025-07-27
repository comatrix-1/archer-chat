import { z } from 'zod';
import { SkillProficiencySchema } from '../inputTypeSchemas/SkillProficiencySchema'
import { SkillCategorySchema } from '../inputTypeSchemas/SkillCategorySchema'

/////////////////////////////////////////
// SKILL SCHEMA
/////////////////////////////////////////

export const SkillSchema = z.object({
  proficiency: SkillProficiencySchema,
  category: SkillCategorySchema,
  id: z.string(),
  name: z.string(),
  resumeId: z.string(),
})

export type Skill = z.infer<typeof SkillSchema>

export default SkillSchema;
