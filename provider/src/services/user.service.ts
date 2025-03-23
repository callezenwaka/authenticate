// provider/src/services/user.service.ts
import { User, getUserRepository } from '@authenticate/database';
import bcrypt from 'bcrypt';
import { logger } from '../utils';
import { CreateUserDto, LoginUserDto } from '../types';

export class UserService {
  async registerUser(userData: CreateUserDto): Promise<User> {
    try {
    const userRepository = await getUserRepository();
    
    // Check if user exists
    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new Error('User with this username or email already exists');
    }

    // Hash password
    const saltRounds = process.env.NODE_ENV === 'development' ? 10 : 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    
    const newUser = userRepository.create({
      ...userData,
      passwordHash,
      isAdmin: false // Default value, can be overridden by admin
    });
    
    const savedUser = await userRepository.save(newUser);
    logger.info(`User created: ${savedUser.id}`);
    
    return savedUser;
  } catch (error) {
    logger.error('Failed to create user', error);
    throw error;
  }
  }

  async loginUser(userData: LoginUserDto) {
    try {
      // Get user from database
      const userRepository = await getUserRepository();
      const user = await userRepository.findOne({
        where: { email: userData.email }
      });
      
      // If no user exists with this email
      if (!user) {
        throw new Error('Invalid email or password: INVALID_CREDENTIALS');
      }
      
      // Compare password with hashed password in database
      const passwordMatch = await bcrypt.compare(userData.password, user.passwordHash);
      
      if (!passwordMatch) {
        throw new Error('Invalid email or password: INVALID_CREDENTIALS');
      }

      // Log successful login
      logger.info(`Successful login: ${user.sub}`);
      
      // Return user data (excluding password)
      return user;
    } catch (error) {
      logger.error('Authentication error:', error);
      throw error;
    }
  }
};