// database/src/repositories/user.repository.ts
import { Repository } from 'typeorm';
import { User } from '../entities';
import { getDataSource } from '../index';

export const getUserRepository = async (): Promise<Repository<User>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(User);
};