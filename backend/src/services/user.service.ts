// backend/src/services/user.service.ts
import { User } from '@authenticate/database';
import { getUserRepository } from '@authenticate/database';
// import { redisClient, } from "@authenticate/database";
import * as crypto from 'crypto';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../types';

export class UserService {
  // Simple password hashing for demo purposes
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async findAll(): Promise<User[]> {
    const userRepository = await getUserRepository();
    return userRepository.find({
      order: {
        createdAt: 'DESC'
      },
      select: ['id', 'username', 'email', 'isAdmin', 'isActive', 'createdAt', 'updatedAt']
    });
  }

  async findById(id: string): Promise<User | null> {
    const userRepository = await getUserRepository();
    return userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'isAdmin', 'isActive', 'createdAt', 'updatedAt']
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const userRepository = await getUserRepository();
    return userRepository.findOne({
      where: { username }
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const userRepository = await getUserRepository();
    
    // Check if user exists
    const existingUser = await userRepository.findOne({
      where: [
        { username: userData.username },
        { email: userData.email }
      ]
    });
    
    if (existingUser) {
      throw new Error('User with this username or email already exists');
    }
    
    const passwordHash = this.hashPassword(userData.password);
    
    const newUser = userRepository.create({
      ...userData,
      passwordHash,
      isAdmin: false // Default value, can be overridden by admin
    });
    
    return userRepository.save(newUser);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    const userRepository = await getUserRepository();
    const user = await userRepository.findOneBy({ id });
    
    if (!user) {
      return null;
    }
    
    // If password is being updated, hash it
    if (userData.password) {
      userData.passwordHash = this.hashPassword(userData.password);
      delete userData.password;
    }
    
    Object.assign(user, userData);
    return userRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const userRepository = await getUserRepository();
    const result = await userRepository.delete(id);
    return result.affected !== 0;
  }

  async authenticate(loginData: LoginUserDto): Promise<User | null> {
    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({
      where: { username: loginData.username }
    });
    
    if (!user) {
      return null;
    }
    
    const passwordHash = this.hashPassword(loginData.password);
    
    if (passwordHash !== user.passwordHash) {
      return null;
    }
    
    return user;
  }
}