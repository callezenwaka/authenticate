// database/src/repositories/blog.repository.ts
import { Repository } from 'typeorm';
import { Blog } from '../entities';
import { getDataSource } from '../index';

export const getBlogRepository = async (): Promise<Repository<Blog>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Blog);
};