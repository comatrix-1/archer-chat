import { z } from 'zod';

export const LocationTypeSchema = z.enum(['ON_SITE','REMOTE','HYBRID']);

export type LocationTypeType = `${z.infer<typeof LocationTypeSchema>}`

export default LocationTypeSchema;
