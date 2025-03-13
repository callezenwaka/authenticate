import { Blog } from '../entities';

export const blogSeedData: Partial<Blog>[] = [
  {
    title: 'Getting Started with TypeScript',
    description: 'A beginner\'s guide to TypeScript and its powerful features.',
    author: 'Jane Smith',
    isActive: true
  },
  {
    title: 'Building Microservices with Node.js',
    description: 'Learn how to design and implement microservices architecture using Node.js and TypeScript.',
    author: 'John Doe',
    isActive: true
  },
  {
    title: 'PostgreSQL Performance Tuning',
    description: 'Advanced techniques for optimizing PostgreSQL databases for high-performance applications.',
    author: 'Alex Johnson',
    isActive: true
  },
  {
    title: 'Docker for Development Environments',
    description: 'How to set up consistent development environments using Docker containers.',
    author: 'Sarah Williams',
    isActive: true
  },
  {
    title: 'RESTful API Design Best Practices',
    description: 'Guidelines and tips for designing clean, efficient, and scalable RESTful APIs.',
    author: 'Michael Brown',
    isActive: true
  }
];