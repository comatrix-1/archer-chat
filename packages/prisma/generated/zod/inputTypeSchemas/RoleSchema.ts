import { z } from 'zod';

export const RoleSchema = z.enum(['JOBSEEKER','RECRUITER']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export default RoleSchema;
