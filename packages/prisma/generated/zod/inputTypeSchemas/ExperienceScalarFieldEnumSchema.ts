import { z } from 'zod';

export const ExperienceScalarFieldEnumSchema = z.enum(['id','title','employmentType','company','location','locationType','startDate','endDate','description','resumeId']);

export default ExperienceScalarFieldEnumSchema;
