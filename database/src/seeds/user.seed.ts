// database/src/seeds/user.seed.ts
import { User } from '../entities';
import * as crypto from 'crypto';

// Simple password hashing function (for demo purposes only)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const userSeedData: Partial<User>[] = [
  {
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: hashPassword('admin123'),
    isAdmin: true,
    isActive: true
  },
  {
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: hashPassword('password123'),
    isAdmin: false,
    isActive: true
  },
  {
    username: 'janesmith',
    email: 'jane@example.com',
    passwordHash: hashPassword('password123'),
    isAdmin: false,
    isActive: true
  }
];