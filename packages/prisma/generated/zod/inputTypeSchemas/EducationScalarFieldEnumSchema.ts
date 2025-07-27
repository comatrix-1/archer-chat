import { z } from 'zod';

export const EducationScalarFieldEnumSchema = z.enum(['id','school','degree','fieldOfStudy','startDate','endDate','gpa','gpaMax','location','description','resumeId','createdAt','updatedAt']);

export default EducationScalarFieldEnumSchema;
