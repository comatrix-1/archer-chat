import { TRPCError } from '@trpc/server';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { TSignInInput, TSignUpInput, TAuthResponse } from './schema';

// Mock user store - replace with your actual database calls
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

// In-memory store for demo purposes
const users: User[] = [];

class AuthService {
  async signIn(input: TSignInInput): Promise<TAuthResponse> {
    const { email, password } = input;
    
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
    const payload = { userId: user.id, email: user.email };
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const options: jwt.SignOptions = { expiresIn: '1h' };
    
    return jwt.sign(payload, secret, options);
  }

  private async verifyTOTP(secret: string, code: string): Promise<boolean> {
    // Implement TOTP verification logic here
    // This is a placeholder - use a proper TOTP library like 'otplib' or 'speakeasy'
    return true; // Replace with actual verification
  }
}

export const authService = new AuthService();
