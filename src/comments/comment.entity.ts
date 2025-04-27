import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Opinion } from '../opinions/opinion.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  text: string;

  @CreateDateColumn()
  created: Date;

  // Reference to the User entity
  @ManyToOne(() => User, (user) => user.comments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Use a unique column name for the foreign key
  owner: User;

  // Reference to the Opinion entity
  @ManyToOne(() => Opinion, (opinion) => opinion.comments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opinion_id' }) // Use a unique column name for the foreign key
  opinion: Opinion;
}