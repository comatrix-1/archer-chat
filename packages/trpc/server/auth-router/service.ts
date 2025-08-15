import { TRPCError } from '@trpc/server';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { TSignInInput, TSignUpInput, TAuthResponse } from './schema';

// Mock user store - replace with your actual database calls
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  is2FAEnabled?: boolean;
  totpSecret?: string;
}

// In-memory store for demo purposes
let users: User[] = [];

class AuthService {
  async signIn(input: TSignInInput): Promise<TAuthResponse> {
    const { email, password, totpCode } = input;
    
    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Check if 2FA is required
    if (user.is2FAEnabled) {
      if (!totpCode) {
        return {
          success: true,
          requires2FA: true,
          message: '2FA verification required',
        };
      }
      
      // Verify TOTP code (implement your TOTP verification logic)
      const isValidTOTP = await this.verifyTOTP(user.totpSecret!, totpCode);
      if (!isValidTOTP) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid 2FA code',
        });
      }
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      sessionToken: token,
    };
  }

  async signUp(input: TSignUpInput): Promise<TAuthResponse> {
    const { email, password, name } = input;

    // Check if user already exists
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists',
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      is2FAEnabled: false, // 2FA disabled by default
    };

    users.push(newUser);

    // Generate JWT token
    const token = this.generateToken(newUser);

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      sessionToken: token,
    };
  }

  private generateToken(user: User): string {
    // In a real app, use environment variables for the secret
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '1d' }
    );
  }

  private async verifyTOTP(secret: string, code: string): Promise<boolean> {
    // Implement TOTP verification logic here
    // This is a placeholder - use a proper TOTP library like 'otplib' or 'speakeasy'
    return true; // Replace with actual verification
  }
}

export const authService = new AuthService();
