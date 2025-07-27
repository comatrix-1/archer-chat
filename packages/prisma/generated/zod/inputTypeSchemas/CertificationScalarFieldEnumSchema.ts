import { z } from 'zod';

export const CertificationScalarFieldEnumSchema = z.enum(['id','name','issuer','issueDate','expiryDate','credentialId','resumeId']);

export default CertificationScalarFieldEnumSchema;
