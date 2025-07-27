import { z } from 'zod';

export const StatusSchema = z.enum(['ACTIVE','PENDING','INTERVIEW','REJECTED','ACCEPTED']);

export type StatusType = `${z.infer<typeof StatusSchema>}`

export default StatusSchema;
