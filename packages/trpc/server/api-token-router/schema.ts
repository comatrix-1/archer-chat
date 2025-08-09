import { z } from 'zod';

export const ZCreateTokenMutationSchema = z.object({
  tokenName: z.string().min(1, 'Token name is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  expirationDate: z.date().optional(),
});

export type TCreateTokenInput = z.infer<typeof ZCreateTokenMutationSchema>;

export const ZDeleteTokenMutationSchema = z.object({
  id: z.string().min(1, 'Token ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
});

export type TDeleteTokenInput = z.infer<typeof ZDeleteTokenMutationSchema>;
