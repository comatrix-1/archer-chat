import { z } from 'zod';

/////////////////////////////////////////
// CERTIFICATION SCHEMA
/////////////////////////////////////////

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().nullable(),
  credentialId: z.string().nullable(),
  resumeId: z.string(),
})

export type Certification = z.infer<typeof CertificationSchema>

export default CertificationSchema;
