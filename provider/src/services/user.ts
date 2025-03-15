import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Interface for User data
export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}

// For demonstration, using in-memory storage
// In production, replace with a database
const users: User[] = [
  // Add the default user
  {
    id: '1',
    email: 'foo@bar.com',
    // Hashed version of 'foobar'
    password: '$2b$10$iqEDgGXQkWhrDIjp0/LTxOGv.T94OgSFiHP5QFI4kRmfkHnSYl5/S',
    createdAt: new Date()
  }
];

export const userService = {
  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Create new user
  async createUser(email: string, password: string, name?: string): Promise<User> {
    // Check if user already exists
    if (await this.getUserByEmail(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };

    // Add to users array
    users.push(newUser);

    return newUser;
  },

  // Authenticate user
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user;
  }
};