import { z } from 'zod';

export const TSignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // For 2FA in the future
  totpCode: z.string().optional(),
  // For remember me functionality
  rememberMe: z.boolean().optional().default(false),
});

export const TSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  // Add other registration fields as needed
});

export const TAuthResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    // Add other user fields as needed
  }).optional(),
  // For 2FA
  requires2FA: z.boolean().optional(),
  // For session management
  sessionToken: z.string().optional(),
});

export type TSignInInput = z.infer<typeof TSignInSchema>;
export type TSignUpInput = z.infer<typeof TSignUpSchema>;
export type TAuthResponse = z.infer<typeof TAuthResponse>;
