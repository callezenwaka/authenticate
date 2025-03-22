// provider/src/types/register.types.ts
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}
