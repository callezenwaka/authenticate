// node-service/src/types/user.types.ts
export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginUserDto {
    username: string;
    password: string;
  }
  
  export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    passwordHash?: string;
    isAdmin?: boolean;
    isActive?: boolean;
  }