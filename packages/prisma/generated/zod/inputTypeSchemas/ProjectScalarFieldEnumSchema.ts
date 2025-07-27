import { z } from 'zod';

export const ProjectScalarFieldEnumSchema = z.enum(['id','title','startDate','endDate','description','resumeId']);

export default ProjectScalarFieldEnumSchema;
