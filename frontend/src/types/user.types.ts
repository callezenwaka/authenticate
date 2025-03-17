// src/types/user.types.ts
export interface User {
  id?: string;
  sub?: string;      // Subject identifier from ID token
  username: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}