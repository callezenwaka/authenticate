// src/types/blog.types.ts
export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}