// database/src/entities/user.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { Blog } from './blog.entity';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column() // Removed nullable as it will always have a value
  sub!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Blog, blog => blog.user)
  blogs!: Blog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert() // TypeORM lifecycle event
  generateIdAndSub() {
    this.id = uuidv4();
    this.sub = this.id;
  }
}