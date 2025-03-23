// database/src/seeds/user.seed.ts
import { User } from '../entities';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Simple password hashing function (for demo purposes only)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const userSeedData: Partial<User>[] = [
  {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: hashPassword('admin123'),
    sub: '', // Will be set to the same as id in run-seeds.ts
    isAdmin: true,
    isActive: true
  },
  {
    id: uuidv4(),
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: hashPassword('password123'),
    sub: '', // Will be set to the same as id in run-seeds.ts
    isAdmin: false,
    isActive: true
  },
  {
    id: uuidv4(),
    username: 'janesmith',
    email: 'jane@example.com',
    passwordHash: hashPassword('password123'),
    sub: '', // Will be set to the same as id in run-seeds.ts
    isAdmin: false,
    isActive: true
  }
];