import { z } from 'zod';

export const EmploymentTypeSchema = z.enum(['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE','SELF_EMPLOYED']);

export type EmploymentTypeType = `${z.infer<typeof EmploymentTypeSchema>}`

export default EmploymentTypeSchema;
